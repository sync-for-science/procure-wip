import fetch from "cross-fetch";
import stripJsonComments from "strip-json-comments";
import tv4 from "tv4";
import endpointListSchema from "../schemas/endpoint-list-schema.json";
import configSchema from "../schemas/config-schema.json";


function loadConfigFile(path) {
	return fetch(path)
		.then( response => {
			if (!response.ok)
				throw new Error(`${path} - HTTP ${response.status} - ${response.statusText}`);
			return response;
		})
		.then( data => data.text() )
		.then( data => JSON.parse(stripJsonComments(data)) )
		.then( data => {
			tv4.validate(data, configSchema);
			if (tv4.error) {
				if (console) console.log(tv4.error);
				throw new Error(path + ": " + tv4.error.message);
			}
			return data;
		})
		//check for invalid queryProfile name references (can't do this in json schema)
		.then( config => {
			const queryProfileNames = Object.keys(config.queryProfiles);
			config.endpointLists && config.endpointLists.forEach( endpoint => {
				if (endpoint.defaults && endpoint.defaults.queryProfile && 
					queryProfileNames.indexOf(endpoint.defaults.queryProfile) === -1
				) throw new Error(
					"Invalid default query profile in " + 
					path + " - " + endpoint.defaults.queryProfile
				);
			})
			return config;
		})
		.then( config => loadEndpointLists(config) )
		.then( config => {
			config.redirectUri = config.redirectUri || 
				window.location.href.split(/\?|#/)[0].replace(/\/*$/, "/callback.html");
			return config;
		})

}

function loadEndpointLists(config) {
	if (!config.endpointLists) return config;

	const getEndpointList = (endpointList, i) => {
		if (!endpointList.path) return;

		return fetch(endpointList.path)
			.then( response => {
				if (!response.ok)
					throw new Error(`${endpointList.path} - HTTP ${response.status} - ${response.statusText}`);
				return response;
			})		
			.then( data => data.text() )
			.then( data => JSON.parse(stripJsonComments(data)) )
			.then( data => {
				tv4.validate(data, endpointListSchema);
				if (tv4.error) {
					if (console) console.log(tv4.error);
					throw new Error(endpointList.path + ": " + tv4.error.message);
				}
				return data;
			})
			//check for invalid queryProfile name references (can't do this in json schema)
			.then( data => {
				const queryProfileNames = Object.keys(config.queryProfiles);
				(data.entry || data.Entries || []).forEach( endpoint => {
					if (endpoint.queryProfile &&
						queryProfileNames.indexOf(endpoint.queryProfile) === -1
					) throw new Error(
						"Invalid default query profile in " + 
						endpointList.path + " - " + endpoint.queryProfile
					);
				})
				return data; 
			})
			.then( data => {
				const result = (data.Entries || data.entry).map( entry => {
					let newEntry = {...entry}
					//standardize epic format
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
					//add defaults group name
					if (endpointList.defaults)
						newEntry.defaultId = i;
					return newEntry;
				});
				return result
			})
			.catch( e => { 
				if (e.message) throw e;
				throw new Error("Error reading " + endpointList.path)
			})
	}

	return Promise.all(config.endpointLists.map((l,i) => getEndpointList(l,i)))
		.then( data => {
			const organizations = [].concat.apply([], data);
			const orgDefaults = {};
			config.endpointLists.forEach((list, i) => {
				if (list.defaults) orgDefaults[i] = list.defaults;
			});
			return {...config, orgDefaults, organizations, endpointLists: null}
		});
}

export default { loadConfigFile }