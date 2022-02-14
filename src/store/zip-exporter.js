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
	if (provider.data.errorLog.length)
		zipFolder.file("error_log.json", JSON.stringify(provider.data.errorLog, null, 2));
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
	return exportProvidersAsBlob(providers)
		.then( blob => saveAs(blob, fileName) );
}

function exportProvidersAsBlob(providers) {
	return new Promise( (resolve, reject) => {
		const zip = new jszip();
		providers.filter( p => p.data && p.selected).forEach( provider => {
			const folder = zip.folder( sanitizeFilename(provider.name) );
			addProviderToZip(folder, provider);
		});
		zip.generateAsync({type: "blob"})
			.then( resolve )
			.catch( reject );
	});
}

function generateFile(providers, multiProviderFileName) {
	const exportableProviders = _.filter(providers, p => {
		return p.data && p.data.entry && p.selected && (p.data.entry.length || p.data.errorLog.length)
	});
	
	//work around jszip timezone bug
	const currDate = new Date();
	const dateWithOffset = new Date(currDate.getTime() - currDate.getTimezoneOffset() * 60000);
	jszip.defaults.date = dateWithOffset;
	
	if (exportableProviders.length > 1) {
		return exportProviders(exportableProviders, multiProviderFileName);
	} else {
		return exportProvider(exportableProviders[0]);
	}
}

export default { generateFile, exportProvidersAsBlob }