import tv4 from "tv4";
import  matchUrl from 'match-url-wildcard';
import configSchema from "../schemas/upload-manifest-schema.json";
import _ from "lodash";

export default class FileExporter {

	cancel() {
		this.isCancelled = true;
		this.controller.abort();
	}

	resetCancelled() {
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.isCancelled = false;
	}

	isValidUrl(url, whitelist) {
		return _.find(whitelist, rule => matchUrl(url, rule)) !== undefined;
	}

	getManifest(url) {
		this.resetCancelled();
		const config = {
			signal: this.signal,
			accept: "application/json"
		}
		return fetch(url, config)
			.then( response => {
				if (!response.ok)
					throw new Error(`HTTP ${response.status} - ${response.statusText}`);
				return response;
			})
			.then( data => data.json() )
			.then( data => {
				tv4.validate(data, configSchema);
				if (tv4.error) {
					if (console) console.log(tv4.error);
					throw new Error(url + ": " + tv4.error.message);
				}
				return data;
			});
	}
	
	putFile(url, file) {
		this.resetCancelled()
		const config = {
			signal: this.signal,
			method: "PUT",
			headers: {
				"Content-Type": "application/octet-stream"
			},
			body: file
		}
		return fetch(url, config)
			.then( response => {
				if (!response.ok)
					throw new Error(`HTTP ${response.status} - ${response.statusText}`);
				return response;
			})
			.then( response => {
				const contentType = response.headers.get("content-type");
				if (contentType && contentType.indexOf("application/json") !== -1) {
					return response.json();
				} else {
					return {};
				}
			})
			.then( data => {
				if (data.error) throw new Error(data.error);
			})
			.catch( error => {	
				console.log(error);
				if (error.name === "AbortError") {
					throw(error);
				} else {
					throw new Error(`An error occurred sending your data: ${error.message}`);
				}
			})
	}


}