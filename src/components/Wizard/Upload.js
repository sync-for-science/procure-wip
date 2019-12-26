/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, { useEffect, useCallback } from "react";
import useStoreon from "storeon/react";
import DownloadButton from "./DownloadButton";
import { Button, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight, faChevronLeft } from "@fortawesome/free-solid-svg-icons"

export default () => {
	//app state
	const {uiState, upload, dispatch} = useStoreon("uiState", "upload");

	const handleBack = useCallback( e => {
		if (e) e.preventDefault()
		dispatch("uiState/set", {mode: "review"})
	}, [dispatch]);

	const handleDone = useCallback( e => {
		if (e) e.preventDefault()
		if (upload.continueUrl) 
			window.location.href = upload.continueUrl;
	}, [upload]);

	const handleCancel = useCallback( e => {
		e.preventDefault()	
		dispatch("export/upload/cancel");
		dispatch("uiState/set", {mode: "review"});
	}, [dispatch]);

	//escape key effect
	//creates a warning due to a reactjs bug: https://github.com/facebook/react/pull/15650 
	useEffect(() => {
		const downHandler = e => {
			if (e.keyCode !== 27 || uiState.submode === "uploading") return;
			handleCancel(e);
		};
		window.addEventListener("keydown", downHandler);
		return () => {
			window.removeEventListener("keydown", downHandler);
		};
	}, [uiState.submode, handleCancel, handleBack]);

	const renderWorking = () => <div className="p-4 text-center">
		<h5 className="mb-4">{uiState.status || "Preparing to send data"}</h5>
		<div className="my-4">
			<Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
		</div>
		<div>
			<Button color="outline-primary" onClick={handleCancel}>Cancel</Button>
		</div>
	</div>

	const renderError = () => <div className="p-2">
		<h5>Error</h5>
		<p>{uiState.status}</p>
		<div>
			<Button color="primary" className="mt-4" onClick={handleBack}>
			<FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
				<span className="mr-2">Back</span>
			</Button>
		</div>
	</div>

	const renderPostUpload = () => 	<div className="p-2">
		<h5>Success</h5>
		<p>{
			upload.successMessage || 
			("Your healthcare records have been successfully shared with " + upload.name + ".")
		}</p>
		<DownloadButton className="float-left mt-4" />
		{upload.continueUrl &&
			<Button color="success" className="float-right mt-4" onClick={handleDone}>
				<span className="mr-2">
					{ upload.continueLabel || "Continue to " + upload.name }
				</span>
				<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
			</Button>
		}
		<div className="clearfix"></div>
	</div>

	return <div>
		{uiState.submode === "error" && renderError()}
		{uiState.submode !== "postUpload" && uiState.submode !== "error" && renderWorking()}
		{uiState.submode === "postUpload" && renderPostUpload()}
	</div>

}