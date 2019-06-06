import gh from "./github-api";
import sanitizeFilename from "sanitize-filename";
import _ from "lodash";

export default class GithubExporter {

	cancel() {
		this.canceled = true;
	}

	blobToBase64(blob) {
		return new Promise( (resolve, reject) => {
			let reader = new FileReader();
			reader.onload = () => {
				const dataUrl = reader.result;
				const base64 = dataUrl.split(',')[1];
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}
	
	buildProviderTree(provider, folder) {	
		const createBlob = (content, fileName, encoding="utf-8") => {
			if (this.canceled) throw new Error("Canceled");

			if (this.statusCb)
				this.statusCb("Adding " + folder + "/" + fileName);

			return gh.createBlob(this.config, {content, encoding})
				.then( blob => {
					return {
						sha: blob.sha,
						path: folder + "/" + fileName,
						mode: "100644", //file
						type: "blob"
					}
				})
		};

		const buildResourceTree = (bundles) => {
			return Promise.all(
				_.map( bundles, (bundle, resourceType) => {
					return createBlob(
						JSON.stringify(bundle),
						resourceType+".json"
					)
				})
			)
		}

		const buildFileTree = (files) => {
			return Promise.all(
				_.map( files, file => {
					return this.blobToBase64(file.blob)
						.then( base64 => {
							return createBlob(base64, file.fileName, "base64") 
						})
				})
			)
		}

		const bundles = _.chain(provider.data.entry)
			.groupBy(e => e.resource.resourceType)
			.mapValues(entry => {
				return {
					entry: _.map(entry, e => ({fullUrl: e.fullUrl, resource: e.resource}) ),
					total: entry.length, 
					type:"collection"
				}
			}).value();

		return Promise.all([
			buildResourceTree(bundles),
			buildFileTree(provider.data.files)
		]).then( trees => _.flatten(trees) );

	}
	
	buildTree(baseTree, allProviders) {
		const providers = _.filter( allProviders, p => {
			return p.data && p.data.entry.length
		})
		const folders = _.map(providers, p => {
			return sanitizeFilename(p.name);
		})
		const tree = baseTree.tree.filter( item => {
			return folders.find( f => item.path.indexOf(f) !== 0)
		});
		return Promise.all( 
			_.map( providers, (provider, i) => {
				return this.buildProviderTree(provider, folders[i]);
			})
		).then( newTrees => {
			return { 
				...baseTree, 
				tree: tree.concat(_.flatten(newTrees))
			}
		})
	}

	prepareCommit(providers) {
		let lastCommit;
		if (this.statusCb)
			this.statusCb("Retrieving repository information");

		return gh.getLastCommit(this.config)
			.then( commit => {
				lastCommit = commit;
				if (this.canceled) throw new Error("canceled");
				return gh.getTree(this.config, commit);
			})
			.then( commit => {
				if (this.canceled) throw new Error("canceled");
				return this.buildTree(commit, providers) 
			})
			.then( tree => {
				if (this.canceled) throw new Error("canceled");
				return gh.createTree(this.config, tree) 
			})
			.then( tree => ({ tree, lastCommit }) );
	}

	export(providers, githubConfig, statusCb, branchName) {
		this.config = githubConfig;
		this.canceled = false;
		this.statusCb = statusCb;
		return githubConfig.pullRequest 
			? this.commitPullRequest(providers, branchName)
			: this.commitToMaster(providers);
	}

	commitToMaster(providers) {
		return this.prepareCommit(providers)
			.then( ({tree, lastCommit}) => {

				if (this.canceled) throw new Error("canceled");

				if (this.statusCb)
					this.statusCb("Committing files");

				return gh.commitTree(
					this.config,
					tree,
					"ProcureBot Commit",
					lastCommit
				).then( () => {
					if (this.statusCb)
						this.statusCb("Data has been committed to master branch");
				});
			});
	}

	commitPullRequest(providers, branchName) {
		if (!branchName) 
			branchName = "Procure/" + 
				(new Date().toISOString()).replace(/:/g, "-");

		return this.prepareCommit(providers)
			.then( ({tree, lastCommit}) => {

				if (this.canceled) throw new Error("canceled");

				if (this.statusCb)
					this.statusCb("Creating pull request");

				return gh.commitTreeToPullRequest(
					this.config,
					tree,
					"ProcureBot commit",
					lastCommit,
					"ProcureBot pull request",
					branchName
				).then( () => {
					if (this.statusCb)
						this.statusCb("A new pull request has been created");
				})
			});		
	}

}