import "cross-fetch";
import _ from "lodash";

function fetchFHIR(url, config={}, fhirVersion="DSTU2", token=null, retryLimit=0, retries=0) {
	if (!config) config = {};
	if (!config.headers) config.headers = {};
	if (!config.headers.Accept) {
		const isR2 = fhirVersion.toUpperCase() === "DSTU2" || fhirVersion.toUpperCase() === "R2";
		config.headers.Accept = isR2 ? "application/json+fhir" : "application/fhir+json"; 
	}
	if (token) config.headers.Authorization = `Bearer ${token}`

	// if (console) console.log("Fetching: " + url);

	return fetch(url, config)
		.then( response => {
			if (!response.ok)
				throw new Error(`HTTP ${response.status} - ${response.statusText}`);
			return response;
		})
		.then( data => data.json() )
		// .then( json => { console.log(json); return json; })
		.then( json => {
			if (!json.resourceType || json.resourceType === "OperationOutcome") {
				const error = json.issue && json.issue[0] && json.issue[0].diagnostics;
				throw new Error(error || "Fetch failed for " + url);
			}
			return json;
		})
		.catch( err => {
			if (retryLimit && retries < retryLimit) {
				return fetchFHIR(url, config, fhirVersion, toString, retryLimit, retries+1)
			} else {
				throw err;
			}
		});
}

function buildQs(fhirParams) {
	return "?" + Object.keys(fhirParams).map( k => {
		const value = Array.isArray(fhirParams[k]) ? fhirParams[k].join(",") : fhirParams[k];
		return k + "=" + encodeURIComponent(value);
	}).join("&");
}


function replaceValue(path, element, replaceFn) {
	if (typeof(path) === "string")
		path = path.split(".");

	if (!element) return;

	const value = element[path[0]];
	const nextPath = path.slice(1);

	if (!nextPath.length && value !== undefined) {
		const newValue = replaceFn(value);
		if (newValue !== undefined) element[path[0]] = newValue;

	} else if (value !== undefined) {
		(Array.isArray(value) ? value : [value])
			.forEach( v => replaceValue(nextPath, v, replaceFn) )
	}
	
	return element;
}

function pathToValues(path, element) {
	if (typeof(path) === "string")
		path = path.split(".");

	if (!element) return [];

	let value = element[path[0]] || [];
	if (!Array.isArray(value)) value = [value];
	const nextPath = path.slice(1);

	if (!nextPath.length) return value

	return value
		.map( v => pathToValues(nextPath, v) )
		.reduce((a, b) => a.concat(b), []) //flatten
		.filter( v => v !== undefined);
}

//this is probably too simplistic
function buildAbsoluteUrl(fhirEndpoint="", reference) {
	if (/^http/.test(reference)) {
		return reference;
	} else {
		return fhirEndpoint.replace(/\/*$/, "/") + reference;
	}
}

function addProvenance(resource, fhirEndpoint, fhirVersion="R2") {
	resource.meta = resource.meta || {};
	if (fhirVersion.toUpperCase() === "STU4" || fhirVersion.toUpperCase() === "R4") {
		resource.meta.source = resource.meta.source || fhirEndpoint;
	} else {
		resource.meta.extension = resource.meta.extension || [];
		//per http://build.fhir.org/versions.html#extensions
		resource.meta.extension.push({
			url: "http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source",
			valueUri: fhirEndpoint
		})
	}
	return resource;
}

function getResourcesByQuery({ fhirEndpoint, query={}, retryLimit=0, token, signal, allowErrors, statusCallback }) {
	let entry = [];
	return new Promise( (resolve, reject) => {

		const fetchResources = (url, retries=0, page=1) => {
			if (statusCallback) statusCallback(url);
			fetchFHIR(url, {signal}, query.fhirVersion, token, retryLimit)
				.then( fhirData => {
					//single resource fetch (Operation Outcomes are converted to errors in fetchFHIR function)
					if (fhirData.resourceType !== "Bundle") {
						fhirData = addProvenance(fhirData, fhirEndpoint, query.fhirVersion);
						return resolve({
							query, entry: [{resource: fhirData, fullUrl: url}]
						});
					}
					//Epic returns Operation Outcomes in bundles to indicate data is not guaranteed to be complete
					entry = entry.concat(
						(fhirData.entry || [])
							.filter( r => r.resource.resourceType !== "OperationOutcome")
							.map(r => {
								r.resource = addProvenance(r.resource, fhirEndpoint, query.fhirVersion);
								r.fullUrl = buildAbsoluteUrl(fhirEndpoint, r.resource.resourceType + "/" + r.resource.id);
								return r;
							})
					);

					//walk to next bundle or return resources
					const nextUrl = fhirData.link && fhirData.link.find(l => l.relation === "next");
					return (nextUrl && (!query.pageLimit || page < query.pageLimit))
						? fetchResources(nextUrl.url, retries, page+1)
						: resolve({ entry, query });
				
				})
				.catch( e => {
					if (allowErrors && e.name !== "AbortError") {
						if (statusCallback) statusCallback(url, true);
						resolve({errorLog: [{fullUrl: url, error: e.message, requestType: "query"}], entry: [], errorCount: 1});
					} else {
						reject(e)
					}
				})
		}

		const url = fhirEndpoint.replace(/\/*$/, "/") + (query.resourcePath || "") + 
			(Object.keys(query.params || {}).length ? buildQs(query.params) : "");
		fetchResources(url);
	
	});

}

function getResourcesByUrl({ urls=[], fhirVersion, retryLimit, token, allowErrors, signal, statusCallback }) {
	
	const getResourceByUrl = (url) => {
		if (statusCallback) statusCallback(url);
		return fetchFHIR(url, {signal}, fhirVersion, token, retryLimit)
			.then( resource => ({fullUrl: url, resource}) )
			.catch( e => {
				if (!allowErrors || e.name === "AbortError") throw e;
				if (statusCallback) statusCallback(url, true);
				return {fullUrl: url, error: e.message, requestType: "reference"};
			});
	}

	return Promise.all( _.map(urls, getResourceByUrl) )
		.then( data => {
			const errorLog = data.filter( r => r.error );
			const entry = data.filter( r => !r.error );
			return allowErrors ? {entry, errorLog} : entry;
		});

}

function findReferences({ entry=[], paths=[], fhirEndpoint }) {
	paths = Array.isArray(paths) ? paths : [paths];
	//add reference element within reference type if not included
	paths = paths.map(p => /\.reference$/.test(p) ? p : p+".reference");

	return _.reduce( entry, (refIndex, ent, i) => {
		_.each( paths, path => {
			_.each( pathToValues(path, ent.resource), ref => {
				//ignore contained references
				if (/^#/.test(ref)) return;
				const url = buildAbsoluteUrl(fhirEndpoint, ref);
				refIndex[url] = refIndex[url] || [];
				refIndex[url].push({i, path, rawUrl: ref});
			});
		});
		return refIndex;
	}, {});
}

//note - this function mutates the entries that are passed in
function embedReferences({ entry=[], refEntry=[], refIndex={} }) {
	_.each( refEntry, ent => {
		let resource;
		_.each( (refIndex[ent.fullUrl] || []), ref => {
			if (!resource) {
				resource = 	entry[ref.i].resource;
				resource.contained = entry[ref.i].resource.contained || [];
				resource.contained.push(ent.resource);
			}
			replaceValue(ref.path, resource, v => {
				if (v === ref.rawUrl) return "#" + ent.resource.id;
			});
		});
	});
	return entry;
}

function followReferences({ entry=[], paths=[], fhirEndpoint, fhirVersion, retryLimit=0, token, allowErrors, signal, statusCallback }) {
	const refIndex = findReferences({ entry, paths, fhirEndpoint });
	return getResourcesByUrl({ urls: _.keys(refIndex), fhirVersion, retryLimit, token, allowErrors, signal, statusCallback })
		.then( data => {
			if (allowErrors) data.errorCount = 
				_.reduce(data.errorLog, (count, ent) => count+refIndex[ent.fullUrl].length, 0);
			return data;
		})
}

function followAndEmbedReferences({ entry=[], paths=[], fhirEndpoint, fhirVersion, retryLimit=0, token, allowErrors, signal, statusCallback }) {
	const refIndex = findReferences({ entry, paths, fhirEndpoint });
	return getResourcesByUrl({ urls: _.keys(refIndex), fhirVersion, retryLimit, token, allowErrors, signal, statusCallback })
		.then( data => {
			const refEntry = allowErrors ? data.entry : data;
			const updatedEntry = embedReferences({ entry, refEntry, refIndex })
			return allowErrors ? {entry: updatedEntry, errorLog: data.errorLog} : updatedEntry;
		})
}

function findAttachments({ entry=[], paths=[], fhirEndpoint }) {
	paths = Array.isArray(paths) ? paths : [paths];

	return _.reduce( entry, (attachmentIndex, ent) => {
		_.each( paths, path => {
			_.each( pathToValues(path, ent.resource), attachment => {
				//ignore embedded data
				if (!attachment.url || attachment.data) return;
				const url = buildAbsoluteUrl(fhirEndpoint, attachment.url);
				const contentType = attachment.contentType || "";
				attachmentIndex[url+"::"+contentType||""] = attachmentIndex[url+"::"+contentType||""] || 
					{contentType: attachment.contentType, url: url, rawUrl: attachment.url, count: 0};
				attachmentIndex[url+"::"+contentType||""].count += 1;
			});
		});
		return attachmentIndex;
	}, {});
}

//this function mutates the resources passed in
function attachmentsToFilenames({ entry = [], files = [], paths }) {
	paths = Array.isArray(paths) ? paths : [paths];
	_.each( entry, ent => {
		_.each( paths, path => {
			ent.resource = replaceValue(path, ent.resource, v => {
				const file = files.find(f => f.rawUrl === v.url && f.contentType === v.contentType);
				if (file) return {...v, url: file.fileName};
			});
		});
	})
	return entry;
}

function findAndDownloadAttachments({ entry=[], paths=[], fhirEndpoint, token, allowErrors, signal, statusCallback, mimeTypeMappings={} }) {
	const attachmentIndex = findAttachments({ entry, paths, fhirEndpoint });
	let i = 0;
	return Promise.all(
		_.map( attachmentIndex, attachment => {
			let config = {signal, headers: {
				Authorization: token ? `Bearer ${token}` : undefined,
				Accept: attachment.contentType || undefined
			}};
			if (statusCallback) statusCallback(attachment.url);
			return fetch(attachment.url, config)
				.then( response => {
					if (!response.ok)
						throw new Error(`HTTP ${response.status} - ${response.statusText}`);
					return response;
				})
				.then( data => data.blob() )
				.then( blob => {
					const urlExtension = attachment.url.match(/\.(.{3})$|\.(.{4})$/);
					const mimeExtension = attachment.contentType && mimeTypeMappings[attachment.contentType];
					const extension = (urlExtension && urlExtension[1]) || mimeExtension;
					const fileName = (i += 1).toString() + (extension ? "." + extension : "");
					return {fileName, fullUrl: attachment.url, blob, contentType: attachment.contentType, rawUrl: attachment.rawUrl}
				})
				.catch( e => {
					if (!allowErrors || e.name === "AbortError") throw e;
					if (statusCallback) statusCallback(attachment.url, true);
					return {fullUrl: attachment.url, contentType: attachment.contentType, error: e.message, requestType: "attachment", rawUrl: attachment.rawUrl};
				})
		})
	).then( data => {
		if (!allowErrors) return data;
		const errorLog = data.filter( r => r.error );
		const errorCount = _.reduce(errorLog, (count, ent) => count+attachmentIndex[ent.fullUrl+"::"+ent.contentType||""].count, 0);
		const files = data.filter( r => !r.error );
		return allowErrors ? { files, errorLog, errorCount } : files;
	});
}


export default { 
	fetchFHIR, replaceValue, pathToValues, findReferences, embedReferences, findAttachments,
	getResourcesByQuery, followAndEmbedReferences, followReferences, findAndDownloadAttachments,
	attachmentsToFilenames
}