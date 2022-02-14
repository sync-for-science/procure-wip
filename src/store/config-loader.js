import fetch from "cross-fetch";
import stripJsonComments from "strip-json-comments";
import tv4 from "tv4";
import endpointListSchema from "../schemas/endpoint-list-schema.json";
import configSchema from "../schemas/config-schema.json";
import FileExporter from "./file-exporter";
import _ from "lodash";
import mergeObjects from "./merge-objects.js";

function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function overlayQsValues(config) {
	const manifestUrl = getUrlParameter("upload_manifest_url");
	if (manifestUrl) {
		config.upload = config.upload || {};
		config.upload.manifestUrl = manifestUrl;
		config.upload.qsManifestUrl = true;
	}
	const label = getUrlParameter("upload_label");
	if (label) {
		config.upload = config.upload || {};
		config.upload.label = label;
	}
	const wizard = getUrlParameter("wizard");
	if (wizard) config.showWizard = true;
	return config;
}


function readConfigFile(path, isOverride) {
	return fetch(path, { headers: {'Accept': 'application/json'} })
		.then( response => {
			if (!response.ok && !isOverride)
				throw new Error(`${path} - HTTP ${response.status} - ${response.statusText}`);				
			
			if (!response.ok && isOverride)
				response = { text: () => "{}" };

			return response;
		})
		.then( data => data.text() )
		.then( data => {
			try {
				return JSON.parse(stripJsonComments(data));
			} catch (e) {
				console.log(e);
				throw new Error(`${path} is not valid JSON.`);
			}
		})

}

function loadConfigFile(path, overridePath, allowQsOverride) {
	let configReaders = [readConfigFile(path)];
	const qsOverridePath = getUrlParameter("config");

	if (qsOverridePath && allowQsOverride) {
		configReaders.push(readConfigFile(qsOverridePath, true));
	} else if (overridePath) {
		configReaders.push(readConfigFile(overridePath, true));
	}

	return Promise.all(configReaders)
		.then( data => mergeObjects.merge(data) )
		.then( data => {
			tv4.validate(data, configSchema);
			if (tv4.error) {
				if (console) console.log(tv4.error);
				throw new Error(path + ": " + tv4.error.message);
			}
			return data;
		})
		//check for invalid queryProfile name and credential references (can't do this in json schema v4)
		.then( config => {
			if (!config.endpointLists) return config;
			
			const invalidEndpointId = _.find( _.keys(config.endpointLists) || [], id => {
				const v = config.endpointLists[id];
				return (
					v && v.defaults && v.defaults.queryProfile && 
					!config.queryProfiles[v.defaults.queryProfile]
				)
			});

			if (invalidEndpointId) throw new Error(
				"Invalid query profile in endpoint " + 
				path + ": /endpointLists/" + invalidEndpointId + "/defaults"
			);

			const invalidCredentialId = _.find( _.keys(config.endpointLists) || [], id => {
				const v = config.endpointLists[id];
				return (
					v && v.defaults && v.defaults.credentialId && 
					!config.credentials[v.defaults.credentialId]
				)
			});

			if (invalidCredentialId) throw new Error(
				"Invalid credential id in endpoint " + 
				path + ": /endpointLists/" + invalidCredentialId + "/defaults"
			);

			return config;
		})
		//check for invalid template name references (can't do this in json schema v4)
		.then( config => {
			if (!config.spreadsheetTemplates) return config;

			const templateNames = Object.keys(config.spreadsheetTemplates);
			templateNames.forEach( templateName => {
				const baseTemplates = config.spreadsheetTemplates[templateName].extends || [];
				baseTemplates.forEach( baseTemplateName => {
					if (templateNames.indexOf(baseTemplateName) === -1)
						throw new Error("Invalid base template name in '" + templateName + "'");
				})
			})
			return config;
		})
		.then( config => {
			if (!config.endpointLists) return config;
			return loadEndpointLists(config);
		})
		.then( config => {
			config.redirectUri = config.redirectUri || 
				window.location.href.split(/\?|#/)[0].replace(/\/*$/, "/callback.html");
			return config;
		})
		.then( config => {
			return overlayQsValues(config);
		})
		//preload manifest if in wizard mode.
		//manifest is loaded on-demand when in full mode so as not to display 
		//unnecessary errors to the user if it fails to load.
		.then( config => {

			if (!config.showWizard || (config.upload && !config.upload.manifestUrl)) 
				return config;
			
			if (!config.upload || (!config.upload.manifestUrl && !config.upload.uploadUrl))
				throw new Error("Upload configuration required for wizard mode");
			
			const fileExporter = new FileExporter();
			if (config.upload.qsManifestUrl) {
				const isValidUrl = fileExporter.isValidUrl(config.upload.manifestUrl, config.upload.whitelist);
				if (!isValidUrl) 
					throw new Error("Url manifest location not in whitelist: " + config.upload.manifestUrl);
			}

			return fileExporter.getManifest(config.upload.manifestUrl)
				.then( manifest => {
					config.upload = {...config.upload, ...manifest}
					return config;
				})
				.catch(e => {
					throw new Error("Unable to load manifest at " + config.upload.manifestUrl);
				});
	

		})
		// .then( config => {
		// 	console.log(config);
		// 	return config;
		// })

}

function loadEndpointLists(config) {

	const getEndpointList = (endpointList, id) => {
		if (!endpointList.path) return;

		return fetch(endpointList.path, { headers: {'Accept': 'application/json'} })
			.then( response => {
				if (!response.ok)
					throw new Error(`${endpointList.path} - HTTP ${response.status} - ${response.statusText}`);
				return response;
			})		
			.then( data => data.text() )
			.then( data => {
				try {
					return JSON.parse(stripJsonComments(data));
				} catch (e) {
					console.log(e);
					throw new Error(`${endpointList.path} is not valid JSON.`);
				}
			})
			//convert Endpoint resource bundle to endpoint list format
			.then( data => {
				if (data.resourceType !== "Bundle") return data;
				const transformedEntries = _.chain(data.entry)
					.filter( entry => entry.resource && 
						entry.resource.name && entry.resource.address &&
						entry.resource.status === "active"
					).map( entry => ({
						fhirEndpoint: entry.resource.address,
						name: entry.resource.name
					})).value();
				return {entry: transformedEntries}
			})
			.then( data => {
				tv4.validate(data, endpointListSchema);
				if (tv4.error) {
					if (console) console.log(tv4.error);
					throw new Error(endpointList.path + ": " + tv4.error.message);
				}
				return data;
			})

			//check for invalid queryProfile name references and credential ids(can't do this in json schema)
			.then( data => {

				(data.entry || data.Entries || []).forEach( endpoint => {
					if (endpoint.queryProfile && !config.queryProfiles[endpoint.queryProfile]
					) throw new Error(
						"Invalid query profile in endpoint list " + 
						endpointList.path + " - " + endpoint.queryProfile
					);
				});

				(data.entry || data.Entries || []).forEach( endpoint => {
					if (endpoint.credentialId && !config.credentials[endpoint.credentialId]
					) throw new Error(
						"Invalid credential id endpoint list " + 
						endpointList.path + " - " + endpoint.credentialId
					);
				})

				return data; 

			})
			.then( data => {
				const result = (data.Entries || data.entry).map( entry => {
					let newEntry = {...entry}
					//standardize old epic format
					if (newEntry.OrganizationName) {
						newEntry.name = newEntry.OrganizationName;
						delete newEntry.OrganizationName;
					}
					if (newEntry.FHIRPatientFacingURI) {
						newEntry.fhirEndpoint = newEntry.FHIRPatientFacingURI;
						delete newEntry.FHIRPatientFacingURI;
					}
					if (newEntry.id) {
						newEntry.orgId = newEntry.id;
						delete newEntry.id;
					} 
					//add unique id if not present
					if (!newEntry.orgId)
						newEntry.orgId = newEntry.name.replace(/\W/g, "");
					
					//add defaults group name
					if (endpointList.defaults)
						newEntry.defaultId = id;
					return newEntry;
				});
				return result
			})
			.catch( e => { 
				if (e.message) throw e;
				throw new Error("Error reading " + endpointList.path)
			})
	}

	//order by key so can de-dupe by name keeping latest
	const endpointPromises = _.chain( config.endpointLists )
		.map( (l, id) => ({l, id}) )
		.sortBy( "id" )
		.reverse()
		.map( item => 
			getEndpointList(item.l, item.id)
				.then( list => list.reverse() )
		)
		.value();
	
	return Promise.all(endpointPromises)
		.then( data => {
			const organizations = _.unionBy(...data, "orgId")
			const orgDefaults = _.mapValues( config.endpointLists, v => v.defaults );
			return {...config, orgDefaults, organizations, endpointLists: null}
		});
}

export default { loadConfigFile }
