import sanitizeFilename from "sanitize-filename";
import _ from "lodash";
import jszip from "jszip";
import { saveAs } from "file-saver";

function addProviderToZip(zipFolder, provider) {
	
	// console.log(JSON.stringify(provider.data))
	
	const bundles = _.chain(provider.data.entry)
		.groupBy(e => e.resource.resourceType)
		.mapValues(entry => {
			return {
				entry: _.map(entry, e => ({fullUrl: e.fullUrl, resource: e.resource}) ),
				total: entry.length, 
				type:"collection"
			}
		}).value();
	_.each(bundles, (bundle, resourceType) => {
		zipFolder.file(resourceType+".json", JSON.stringify(bundle, null, 2)) 
	});
	_.each(provider.data.files, f => {
		zipFolder.file(f.fileName, f.blob, {type: "blob"});
	});
}

function exportProvider(provider) {
	return new Promise( (resolve, reject) => {
		const zip = new jszip();
		addProviderToZip(zip, provider);
		const fileName = sanitizeFilename(provider.name);
		zip.generateAsync({type: "blob"})
			.then( blob => saveAs(blob, fileName) )
			.then( resolve )
			.catch( reject );
	});
}

function exportProviders(providers, fileName="procure-data.zip") {
	return new Promise( (resolve, reject) => {
		const zip = new jszip();
		providers.filter( p => p.data && p.data.entry.length).forEach( provider => {
			const folder = zip.folder( sanitizeFilename(provider.name) );
			addProviderToZip(folder, provider);
		});
		zip.generateAsync({type: "blob"})
			.then( blob => saveAs(blob, fileName) )
			.then( resolve )
			.catch( reject );
	});
}

export default {exportProvider, exportProviders}