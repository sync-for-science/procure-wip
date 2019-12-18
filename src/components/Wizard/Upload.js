/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, { useEffect, useCallback } from "react";
import useStoreon from "storeon/react";
import {
	Button, Spinner, Container, Alert
} from 'reactstrap';

export default () => {
	//app state
	const {uiState, upload, dispatch} = useStoreon("uiState", "upload");

	if (uiState.submode === "preUpload")
		dispatch("export/upload/send");

	const handleHideDialog = useCallback( e => {
		if (e) e.preventDefault()
		dispatch("uiState/set", {state: "ready"})
	}, [dispatch]);

	const handleDone = useCallback( e => {
		if (e) e.preventDefault()
		
		if (upload.continueUrl)
			window.open(upload.continueUrl);
		
		handleHideDialog(e);
	}, [handleHideDialog, upload]);

	const handleCancelExport = useCallback( e => {
		e.preventDefault()	
		dispatch("export/upload/cancel");
		if (uiState.submode === "getManifest")
			dispatch("uiState/set", {state: "ready"})
	}, [dispatch, uiState.submode]);

	//escape key effect
	//creates a warning due to a reactjs bug: https://github.com/facebook/react/pull/15650 
	useEffect(() => {
		const downHandler = e => {
			if (e.keyCode !== 27) return;
			if (uiState.submode === "preUpload" || uiState.submode === "postUpload") {
				handleHideDialog(e);
			} else {
				handleCancelExport(e);
			}
		};
		window.addEventListener("keydown", downHandler);
		return () => {
			window.removeEventListener("keydown", downHandler);
		};
	}, [uiState.submode, handleCancelExport, handleHideDialog]);

	const renderLoading = () => <div className="text-center">
		<h5>
			{uiState.status}
		</h5>
		<div style={{padding: "1rem 0rem"}}>
			<Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
		</div>
		<div>
			<Button className="btn-primary" onClick={handleCancelExport}>Cancel</Button>
		</div>
	</div>

	const renderError = () => <div>
			<Container>
				<Alert color="danger">
					<span>{uiState.error.toString()}</span>
				</Alert>
			</Container>
			<Button color="secondary" onClick={handleHideDialog}>Back</Button>
	</div>

	const renderPostUpload = () => <div className="text-center">
		<h5>{upload.successMessage || "Your information has been transmitted!"}</h5>
		<Button color="primary" onClick={handleDone}>
			{upload.continueUrl ? (upload.continueLabel || "Continue") : "Close"}
		</Button>
	</div>

	return  <div>
		<h5>Share My Data</h5>
		{uiState.error && renderError()}
		{uiState.submode === "getManifest" && !uiState.error && renderLoading()}
		{uiState.submode === "uploading" && !uiState.error && renderLoading()}
		{uiState.submode === "postUpload" && !uiState.error && renderPostUpload()}
	</div>

}