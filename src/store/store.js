import createStore from "storeon";
import FhirLoader from "./fhir-loader";
import ConfigLoader from "./config-loader";
import ZipExporter from "./zip-exporter";
import GithubExporter from "./github-exporter";
import SpreadsheetExporter from "./spreadsheet-exporter";
import UserSettings from "./user-settings";
import FileExporter from "./file-exporter";
import zipExporter from "./zip-exporter";

//have to use require here since imports need to be at the top level
let initialState;
if (process.env.NODE_ENV !== "development") {
	initialState = require("./initial-state");
} else {
	initialState =  require("./initial-state-dev");
}

const fhirLoader = new FhirLoader();
const ghExporter = new GithubExporter();
const fileExporter = new FileExporter();

const createUniqueId = () => Math.random().toString(36);
const actions = store => {
	store.on("@init", () => initialState);
	store.on("uiState/set", (state, uiState) => { 
		return { uiState }
	});
	store.on("uiState/merge", ({ uiState }, newUiState) => {
		return {uiState: {...uiState, ...newUiState}}
	})
	store.on("uiState/incrementCounts", ({ uiState }, counts) => {
		Object.keys(counts).forEach( countType => {
			counts[countType] = counts[countType] + (uiState[countType] || 0)
		});	
		return {uiState: {...uiState, ...counts}}
	})
	store.on("nonModalUi/merge", ({ nonModalUi }, newState) => {
		return {nonModalUi: {...(nonModalUi ||{}), ...newState}}
	});
	store.on("refreshDirty", ({ providers, githubConfig, redirectUri, dirtySnapshot }, reset) => {
		const newSnapshot = UserSettings.buildJSON(providers, githubConfig, redirectUri);
		if (reset) {
			return {isDirty: false, dirtySnapshot: newSnapshot};
		} else {
			return {isDirty: dirtySnapshot === newSnapshot ? false : true};
		}
	})
	store.on("providers/add", ({ providers }, provider) => {
		if (!provider.id) provider.id = createUniqueId();
		provider.selected = true;
		console.log(provider)
		return {providers: providers.concat([provider])}
	});
	store.on("providers/update", ({ providers }, provider) => {
		return {
			providers: providers.map( p => {
				return (p.id !== provider.id) 
					? p 
					: {...p, ...provider}
			})
		}
	});
	store.on("providers/upsert", (state, provider) => {
		if (!provider.id) {
			provider.id = createUniqueId();
			store.dispatch("providers/add", provider);
		} else {
			store.dispatch("providers/update", provider);
		}
	});
	store.on("providers/upsertAndLoad", (state, provider) => {
		store.dispatch("providers/upsert", provider);
		store.dispatch("fhir/loadData", provider.id);
	});
	store.on("providers/remove", ({ providers }, id) => {
		return {
			providers: providers.filter( p => {
				return p.id !== id
			})
		}
	});
	store.on("config/load", ({}, endState="ready") => {
		store.dispatch("uiState/set", {mode: "loading"});
		const overridePath = process.env.NODE_ENV !== "development" 
			? "./config/config-override.json" 
			: "./config/config-override-dev.json";

		ConfigLoader
			.loadConfigFile("./config/config.json", overridePath)
			.then( config => {
				store.dispatch("config/merge", config);

				store.dispatch("uiState/set", {mode: endState});

				//initialize content for refresh
				store.dispatch("refreshDirty", true);
			})
			.catch( e => {
				store.dispatch("uiState/set", {
					mode: "globalError", 
					error: e
				});
			})
	});
	store.on("config/merge", (state, newConfig) => {
		return {...state, ...newConfig}
	});
	store.on("fhir/loadData", ({ providers, queryProfiles, mimeTypeMappings, ignoreState }, providerId) => {
		const provider = providers.find(p => p.id === providerId);
		const queryProfile = queryProfiles[provider.queryProfile];
		const retryLimit = queryProfiles[provider.queryProfile].retryLimit || 0;
		
		const handleLoadDone = (data) => {
			store.dispatch("uiState/set", {
				mode: "loadData",
				submode: "loaded",
				data: data,
				id: provider.id
			});
		}

		const handleStatusUpdate = (url, isError) => {
			if (console) console.log("Fetching: ", url);
			store.dispatch("uiState/incrementCounts", {
				requestCount: 1,
				errorCount: isError ? 1 : 0,
			})
		}
		
		const loadFhir = (context) => {
			store.dispatch("uiState/merge", {submode: "loading"});
			fhirLoader.getFHIR(provider, queryProfile, context, true, mimeTypeMappings, retryLimit, handleStatusUpdate)
				.then(handleLoadDone)
				.catch(handleGlobalError);
		}

		const handleGlobalError = (e) => {
			//don't show error if user clicked the cancel button
			if (e.message === "cancelled" || e.name === "AbortError")
				return;
			
				store.dispatch("uiState/set", {
					mode: "loadData",
					submode: "error",
					status: e.message || e,
					id: provider.id
				});
		}

		if (!provider.isOpen) {
			store.dispatch("uiState/set", {
				mode: "loadData",
				submode: "authorizing",
				id: provider.id
			});
			fhirLoader.authAndGetFHIR(provider, ignoreState)
				.then(loadFhir)
				.catch(handleGlobalError);
		} else {
			store.dispatch("uiState/set", {
				mode: "loadData",
				submode: "loading",
				id: provider.id	
			});		
			loadFhir()
		}
	});
	store.on("fhir/cancelLoad", ({}, endState="ready") =>  {
		fhirLoader.cancel();
		store.dispatch("uiState/set", {mode: endState});
	});

	store.on("export/download", ({ providers }) => {
		store.dispatch("nonModalUi/merge", {isDownloading: true})
		ZipExporter.generateFile(providers)
			.catch( e => {
				store.dispatch("uiState/set", {
					mode: "ready", 
					error: e.message
				});
			})
			.finally( () => {
				store.dispatch("nonModalUi/merge", {isDownloading: false})
			});
	});
	store.on("export/spreadsheet", ({ providers, spreadsheetTemplates}, params) => {
		store.dispatch("nonModalUi/merge", {isExportingSheet: true})
		SpreadsheetExporter.exportSpreadsheet(
			providers, spreadsheetTemplates, params.templateId, params.format
		)
		.catch( e => {
			store.dispatch("uiState/set", {
				mode: "globalError", 
				error: e
			});
		})
		.finally( () => {
			store.dispatch("nonModalUi/merge", {isExportingSheet: false})
		});
	});

	store.on("export/github", ( {githubConfig, providers} ) => {
		
		const statusCallback = (status, statusUrl) => {
			store.dispatch("uiState/merge", { status, statusUrl });
		}

		store.dispatch("uiState/merge", {
			submode: "push",
			error: null
		});

		ghExporter.export(
			providers, githubConfig, statusCallback
		)
			.then( () => {
				store.dispatch("uiState/merge", {
					submode: null
				});
			})
			.catch( e => {
				store.dispatch("uiState/set", {
					mode: "githubExport",
					error: e.message === "canceled" ? null : e.message
				});
			});

	})

	store.on("export/github/cancel", () => {
		ghExporter.cancel();
		store.dispatch("uiState/set", { 
			mode: "githubExport"
		});
	});

	store.on("export/upload", ({upload})  => {
		store.dispatch("uiState/set", { 
			mode: "fileUpload",
			submode: "getManifest",
			status: "Retrieving Upload Details"
		});

		//check whitelist if url doesn't come from config file
		if (upload.qsManifestUrl) {
			const isValidUrl = fileExporter.isValidUrl(upload.manifestUrl, upload.whitelist);
			if (!isValidUrl) return store.dispatch("uiState/merge", {
				error: "Url manifest location not in whitelist: " + upload.manifestUrl
			});
		}

		//if upload url is in config and no overriding manifest url, don't fetch manifest
		if (upload.uploadUrl && !upload.manifestUrl) {
			return store.dispatch("uiState/merge", {
				submode: "preUpload"
			});
		}

		//fetch manifest to get upload info
		fileExporter.getManifest(upload.manifestUrl)
			.then( data => {
				store.dispatch("config/merge", {
					upload: {
						manifestUrl: upload.manifestUrl,
						label: upload.label,
						...data
					}
				});
				store.dispatch("uiState/merge", {
					submode: "preUpload"
				});
			})
			.catch( err => {
				store.dispatch("uiState/merge", {
					error: err.message
				});
			});
	});
	
	store.on("export/upload/cancel", () => {
		fileExporter.cancel();
		store.dispatch("uiState/merge", {
			submode: "preUpload"
		});
	});

	store.on("export/upload/send", ({upload, providers}) => {
		store.dispatch("uiState/merge", { 
			submode: "uploading",
			status: "Uploading Data"
		});

		zipExporter.exportProvidersAsBlob(providers)
			.then( file => {
				return fileExporter.putFile(upload.uploadUrl, file)
			})
			.then( () => {
				store.dispatch("uiState/merge", {
					submode: "postUpload"
				});
			})
			.catch( err => {
				store.dispatch("uiState/merge", {
					error: err.message
				});
			})

	});

	store.on("export/settings", ({providers, githubConfig, redirectUri}) => {
		UserSettings.download(providers, githubConfig, redirectUri);
	});

	store.on("import/settings", ({redirectUri, queryProfiles}, file) => {
		UserSettings.readFromFile(file, redirectUri, queryProfiles)
			.then( config => {
				//unloading data controls prior to modifying config to avoid
				//timing error from control update and unmount at same time
				store.dispatch("uiState/set", {mode: "loading"});
				store.dispatch("config/merge", config);
				store.dispatch("uiState/set", { mode: "ready" });
			})
			.catch( e => {
				store.dispatch("uiState/set", {
					mode: "ready", 
					error: e.message
				})
			})
	});

}

const store = createStore([actions]);

export default store;