/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, { useEffect, useCallback } from "react";
import useStoreon from "storeon/react";
import {
	Button, Spinner, Modal, ModalHeader, 
	ModalBody, ModalFooter, Container, Alert
} from 'reactstrap';

export default () => {
	//app state
	const {uiState, upload, dispatch} = useStoreon("uiState", "upload");

	const handleHideDialog = useCallback( e => {
		if (e) e.preventDefault()
		dispatch("uiState/set", {mode: "ready"})
	}, [dispatch]);

	const handleDone = useCallback( e => {
		if (e) e.preventDefault()
		
		if (upload.continueUrl)
			window.open(upload.continueUrl);
		
		handleHideDialog(e);
	}, [handleHideDialog, upload]);

	const handleCancelExport = useCallback( e => {
		e.preventDefault()
		const endState = uiState.submode === "getManifest"
			? {mode: "ready"}
			: {mode: "fileUpload", submode: "preUpload"}
		dispatch("export/upload/cancel");
		dispatch("uiState/set", endState)
	}, [dispatch, uiState.submode]);

	const handleUploadFile = useCallback( e => {
		e.preventDefault()	
		dispatch("export/upload/send");
	}, [dispatch]);

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

	const renderLoading = () => <ModalBody className="text-center">
		<h5>
			{uiState.status}
		</h5>
		<div style={{padding: "1rem 0rem"}}>
			<Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
		</div>
		<div>
			<Button className="btn-primary" onClick={handleCancelExport}>Cancel</Button>
		</div>
	</ModalBody>

	const renderError = () => <div>
		<ModalBody>
			<Container>
				<Alert color="danger">
					<span>{uiState.status}</span>
				</Alert>
			</Container>
		</ModalBody>
		<ModalFooter>
			<Button color="secondary" onClick={handleHideDialog}>Close</Button>
		</ModalFooter>
	</div>

	const renderUploadDetails = () => <div>
		<ModalBody>
			<p>
				Clicking the <b>upload</b> button below will share your medical record 
			information with <b>{upload.name}</b> and indicates your agreement to the 
			terms of use, privacy policy and other information outlined at 
				<b>&nbsp;<a href={upload.infoUrl} target="_blank" rel="noopener noreferrer">
					{upload.infoUrl}
				</a></b>.
			</p>
		</ModalBody>
		<ModalFooter>
			<Button color="success" onClick={handleUploadFile}>Upload</Button>
			<Button color="secondary" onClick={handleHideDialog}>Cancel</Button>
		</ModalFooter>
	</div>

	const renderPostUpload = () => <div>
		<ModalBody className="text-center">
			<h5>{upload.successMessage || "Your information has been transmitted!"}</h5>
		</ModalBody>
		<ModalFooter>
			<Button color="primary" onClick={handleDone}>
				{upload.continueUrl ? (upload.continueLabel || "Continue") : "Close"}
			</Button>
		</ModalFooter>
	</div>

	return  <Modal isOpen={true} fade={false} backdrop={true}>
		<ModalHeader>Share My Data</ModalHeader>
		{uiState.submode === "error" && renderError()}
		{uiState.submode === "getManifest" && renderLoading()}
		{uiState.submode === "preUpload" && renderUploadDetails()}
		{uiState.submode === "uploading" && renderLoading()}
		{uiState.submode === "postUpload" && renderPostUpload()}
	</Modal>

}