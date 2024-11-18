import Smart from "../smart/smart-core";
import SmartPopup from "../smart/smart-popup";
import FHIR from "../smart/fhir";

export default class FhirLoader {
	
	resetAbortController() {
		this.controller = new AbortController();
		this.signal = this.controller.signal;	
	}

	cancel() {
		if (this.popup) {
			this.popup.cancel();
		} else {
			this.controller.abort();
		}
	}

	mergeAndDeDupeData(data) {
		let uniqueUrls = {};
		let files = [];
		let entry = [];
		let errorLog = [];
		let errorCount = 0;
		data.forEach( queryResult => {
			queryResult.entry.forEach( ent => {
				//prevent duplicates
				if (uniqueUrls[ent.fullUrl]) return;
				uniqueUrls[ent.fullUrl] = true;
				entry.push(ent)
			})
			files = files.concat(queryResult.files || []);
			errorLog = errorLog.concat(queryResult.errorLog || []);
			errorCount += queryResult.errorCount || 0;
		})
		return {entry, files, errorLog, errorCount}
	}

	getFHIR(provider, queryProfile, context, allowErrors=true, mimeTypeMappings={}, retryLimit, statusCallback) {
		const patientId = context ? context.patient : provider.patient;

		const fetchQuery = (query) => {
			let params = {...query.params}
			Object.keys(params).forEach(k => {
				if (Array.isArray(params[k])) params[k] = params[k].join(",");
				params[k] = params[k].toString().replace("{{patientId}}", patientId);
			});
			const path = query.path.replace(/\{patientId\}/g, patientId);

			return FHIR.getResourcesByQuery({
				fhirEndpoint: provider.fhirEndpoint, 
				query: {...query, params, path, fhirVersion: queryProfile.fhirVersion},
				token: context ? context.access_token : null,
				retryLimit,
				allowErrors,
				statusCallback,
				signal: this.signal
			})
			.then( data => {
				if (!query.containReferences) return data;

				return FHIR.followAndEmbedReferences({
					entry: data.entry,
					paths: query.containReferences,
					fhirEndpoint: provider.fhirEndpoint,
					fhirVersion: queryProfile.fhirVersion,
					token: context ? context.access_token : null,
					retryLimit,
					allowErrors,
					statusCallback,
					signal: this.signal
				}).then( result => {
					data.errorLog = data.errorLog || [];
					data.errorLog = data.errorLog.concat(result.errorLog);
					data.errorCount = data.errorCount || 0;
					data.errorCount += result.errorCount;
					data.entry = result.entry;
					return data;
				}); 

			})
			.then( data => {
				if (!query.retrieveReferences) return data;

				return FHIR.followReferences({
					entry: data.entry,
					paths: query.retrieveReferences,
					fhirEndpoint: provider.fhirEndpoint,
					fhirVersion: queryProfile.fhirVersion,
					token: context ? context.access_token : null,
					retryLimit,
					allowErrors,
					statusCallback,
					signal: this.signal
				}).then( result => {
					data.errorLog = data.errorLog || [];
					data.errorLog = data.errorLog.concat(result.errorLog);
					data.errorCount = data.errorCount || 0;
					data.errorCount += result.errorCount;
					data.entry = data.entry.concat(result.entry);
					return data;
				});
			})
			.then( data => {
				if (!query.downloadAttachments) return data;
				return FHIR.findAndDownloadAttachments({
					entry: data.entry,
					paths: query.downloadAttachments,
					fhirEndpoint: provider.fhirEndpoint,
					fhirVersion: queryProfile.fhirVersion,
					token: context ? context.access_token : null,
					retryLimit,
					mimeTypeMappings,
					allowErrors: true,
					statusCallback,
					signal: this.signal
				}).then(result => {
					data.errorLog = data.errorLog || [];
					data.errorLog = data.errorLog.concat(result.errorLog || []);
					data.errorCount = data.errorCount || 0;
					data.errorCount += result.errorCount;
					data.files = result.files;
					data.entry = FHIR.attachmentsToFilenames({
						entry: data.entry, files: result.files, paths: query.downloadAttachments
					});
					return data;
				});
			})
		}

		this.resetAbortController();

		//sequential query
		// return queryProfile.queries.reduce((promiseChain, currentQuery) => {
		// 	return promiseChain.then( chainResults =>
		// 		fetchQuery(currentQuery) .then( currentResult =>
		// 			[ ...chainResults, currentResult ]
		// 		)
		// 	);
		// }, Promise.resolve([]))
		// 	.then( this.mergeAndDeDupeData )

		//parallel (moderated by browser)
		return Promise.all( queryProfile.queries.filter(q => q.skip != true).map(fetchQuery) )
			.then( this.mergeAndDeDupeData )
	}
	
	authAndGetFHIR(provider, ignoreState) {
		//make available to cancel function
		this.popup = new SmartPopup(provider);
		return Smart.getAuthEndpoints(provider.fhirEndpoint)
			.then(authEndpoints => {
				return this.popup.authorize(authEndpoints, ignoreState);
			})
			.then(context => {
				this.popup = null;
				return context;
			}).catch(e => {
				this.popup = null;
				throw e;
			});

	}

}
