const defaultBaseUrl = "https://api.github.com";

function callApi(config, path, method="GET", jsonPayload) {
	const reqConfig = {
		headers: {"Authorization": `Bearer ${config.token}`},
		method
	}
	if (jsonPayload) reqConfig.body = JSON.stringify(jsonPayload);
	
	const url = `${config.baseUrl||defaultBaseUrl}/repos/${config.owner}/${config.project}/${path}`
	return fetch(url, reqConfig).then( response => {
		if (response.ok) {
			return response.json();
		} else if (response.status === 404) {
			throw new Error("Repository not found");
		} else if (response.stats === 500) {
			throw new Error(response.message || "Github API returned a 500 error");
		} else {
			return response.json().then( (json) => {
				throw new Error(json.message);
			});
		}
	})
}

function getLastCommit(config, branchName="master") {
	return callApi(config, `git/refs/heads/${branchName}`)
		//special handling for uninitialized repository (repo without any files)
		.catch( e => {
			if (e.message === "Git Repository is empty.")
				e.message = "Git repository is empty. Please initialize the repository and try again."
			throw e;
		});
}

function getTree(config, commit) {
	return callApi(config, `git/trees/${commit.object.sha}`)
		.then( tree => {
			if (tree.truncated)
				throw new Error("Unable to load entire head tree - too many files");
			return tree;
		})
}

function createBlob(config, blob) {
	return callApi(config, "git/blobs", "POST", blob)
}

function createTree(config, tree) {
	return callApi(config, "git/trees", "POST", tree);
}

function commitTree(config, tree, message, lastCommit, branchName="master") {
		return callApi(config, "git/commits", "POST", {
			message,
			tree: tree.sha,
			parents: [lastCommit.object.sha]
		}).then( commit => {
			return callApi(config, `git/refs/heads/${branchName}`,"PATCH", {
				sha: commit.sha
			})
		})
	}

function commitTreeToPullRequest(config, tree, message, lastCommit, title, newBranchName,  baseBranch="master", bodyText) {
	return callApi(config, "git/commits", "POST", {
		message,
		tree: tree.sha,
		parents: [lastCommit.object.sha]
	}).then( commit => {
		return callApi(config, "git/refs", "POST", {
			ref: `refs/heads/${newBranchName}`,
			sha: commit.sha
		});
	}).then( () => {
		return callApi(config, "pulls", "POST", {
			title: title,
			body: bodyText,
			head: newBranchName,
			base: baseBranch,
			maintainer_can_modify: true
		})
	})
}

export default {
	getLastCommit, getTree, createBlob, 
	createTree, commitTree, commitTreeToPullRequest
}