/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, { useMemo, useEffect } from "react";
import useStoreon from "storeon/react";
import {Button, Spinner, Modal, ModalBody, ModalFooter} from 'reactstrap';
import { saveAs } from "file-saver";

export default () => {

	const { uiState, providers, dispatch } = useStoreon("uiState", "providers");

	const provider =  useMemo( () => {
		return providers.find(p => p.id === uiState.id)
	}, [uiState.id]);

	//escape key effect
	//creates a warning due to a reactjs bug: https://github.com/facebook/react/pull/15650 
	useEffect(() => {
		const downHandler = e => {
			if (e.keyCode !== 27) return;
			if (uiState.submode  === "authorizing" || uiState.submode === "loading") {
				handleCancel(e);
			} else {
				handleClose(e);
			}
		};
		window.addEventListener("keydown", downHandler);
		return () => {
			window.removeEventListener("keydown", downHandler);
		};
	}, []);

	const handleCancel = e => {
		e.preventDefault();
		dispatch("fhir/cancelLoad");
	}

	const handleClose = e => {
		if (e) e.preventDefault();
		dispatch("uiState/set", {mode: "ready"});
	}

	const handleSave = e => {
		e.preventDefault();
		dispatch("providers/update", {
			id: provider.id,
			lastUpdated: new Date(),
			data: uiState.data
		});
		handleClose();
	}

	const handleLogDownload = e => {
		e.preventDefault();
		const blob = new Blob(
			[JSON.stringify(uiState.data.errorLog, null, 2)], 
			{type: "application/json"}
		);
		saveAs(blob, "errors.json");
	}
	
	const renderAuthorizing = () => <div>
		<h5>Waiting for authorization...</h5>
		<div>
			<Button className="btn-primary" onClick={handleCancel}>Cancel</Button>
		</div>
	</div>

	const pluralizeEn = (text, len) => len === 1 ? text : text+"s";

	const renderLoading = () => <div>
		<h5>
			{uiState.requestCount} {pluralizeEn("request", uiState.requestCount)} 
			&nbsp; / &nbsp;
			{uiState.errorCount} {pluralizeEn("error", uiState.errorCount)}
		</h5>
		<div style={{padding: "1rem 0rem"}}>
			<Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
		</div>
		<div>
			<Button className="btn-primary" onClick={handleCancel}>Cancel</Button>
		</div>
	</div>

	const renderLoaded = () => <div>
		<h5>
			{uiState.data.entry.length} {pluralizeEn("resource", uiState.data.entry.length)} retrieved<br/>
			{uiState.data.files.length || "No"} {pluralizeEn("attachment", uiState.data.files.length)} downloaded<br/>
			{uiState.data.errorLog.length || "No"} {pluralizeEn("error", uiState.data.errorLog.length)} occurred
		</h5>
	</div>

	const renderGlobalError = () => <div>
		<h5 style={{padding: "1rem 0", color: "red"}}>An error occurred: { uiState.status }</h5>
		<div>
			<Button className="btn-primary" onClick={handleClose}>Close</Button>
		</div>
	</div>

	
	const renderLoadedButtons = () => {
		const downloadLink = uiState.data.errorLog.length > 0 && 
			<div className="mr-auto"><a href="#" onClick={handleLogDownload}>Download error log</a></div>;
	 	return <ModalFooter>
			{downloadLink}
			<Button color="outline-secondary" onClick={handleClose}>Cancel</Button>
			<Button color="primary" style={{marginLeft: "1em"}} onClick={handleSave}>Save</Button>
		</ModalFooter>
	}

	return <Modal isOpen={true} fade={false} backdrop={true}>
		<ModalBody style={{textAlign: "center"}}>
			<h3>{provider.name}</h3>
			{ uiState.submode === "authorizing" && renderAuthorizing() }
			{ uiState.submode === "loading" && renderLoading() }
			{ uiState.submode === "loaded" && renderLoaded() }
			{ uiState.submode === "error" && renderGlobalError() }
		</ModalBody>
		{ uiState.submode === "loaded" && renderLoadedButtons() }	
	</Modal>


}