import React from "react";
import {Button} from 'reactstrap';
import useStoreon from "storeon/react";

export default () => {

	const { providers, nonModalUi, dispatch } = useStoreon("providers", "nonModalUi");

	const handleAddProvider = (e) => {
		e.preventDefault();
		dispatch("uiState/set", {mode: "editProvider"});
	}

	const handleExportData = (e) => {		
		e.preventDefault();
		dispatch("export/downloadAll", {mode: "editProvider"});
	}

	const handleShowGithubExport = (e) => {
		dispatch("uiState/set", {mode: "githubExport"});
	}

	const resourceCount = providers.find(p => p.data && p.data.entry.length);
	const downloadAllButton = <Button 
		color="outline-secondary"
		style={{marginLeft: "1em"}}
		onClick={handleExportData}
		disabled={nonModalUi.isDownloading}
		> Download All Data
	</Button>;
	const ghExportButton = <Button 
		color="outline-secondary"
		style={{marginLeft: "1em"}}
		onClick={handleShowGithubExport}
		> Export to Github
	</Button>;

	return <div style={{margin: "1em 0"}}>
		<Button color="success" onClick={handleAddProvider}>Add Provider</Button>
		{resourceCount && downloadAllButton}
		{resourceCount && ghExportButton}
	</div>

}