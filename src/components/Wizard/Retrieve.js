/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, { useMemo, useEffect, useCallback } from "react";
import useStoreon from "storeon/react";
import {Button, Spinner} from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"

export default () => {

	const { uiState, providers, dispatch } = useStoreon("uiState", "providers");

	const provider =  useMemo( () => {
		return providers.find(p => p.id === uiState.id)
	}, [uiState.id, providers]);

	const handleCancel = useCallback( e => {
		e.preventDefault();
		dispatch("fhir/cancelLoad", "editProvider");
		dispatch("providers/remove", provider.id)
	}, [dispatch, provider]);

	const handleBack = e => {
		dispatch("providers/remove", provider.id)
		dispatch("uiState/set", {mode: "editProvider"});
	}

	//escape key effect
	//creates a warning due to a reactjs bug: https://github.com/facebook/react/pull/15650 
	useEffect(() => {
		const downHandler = e => {
			if (e.keyCode !== 27) return;
			if (uiState.submode  === "authorizing" || uiState.submode === "loading") {
				handleCancel(e);
			}
		};
		window.addEventListener("keydown", downHandler);
		return () => {
			window.removeEventListener("keydown", downHandler);
		};
	}, [handleCancel, uiState.submode]);

	//TODO: this is kind of a hack to build on non-wizard modes (need to restructure modes to work with both)
	if (uiState.mode !== "loadData") return null;
	if (uiState.submode === "loaded") {
		dispatch("providers/update", {
			id: provider.id,
			lastUpdated: new Date(),
			data: uiState.data
		});
		dispatch("uiState/set", {mode: "review"});
	};

	const renderWorking = (status) => <div className="p-4 text-center">
		<h5 className="mb-4">{status}</h5>
		<div className="my-4">
			<Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
		</div>
		<div>
			<Button color="outline-primary" onClick={handleCancel}>Cancel</Button>
		</div>
	</div>

	const renderGlobalError = () => <div className="p-2">
		<h5>Error</h5>
		<p>An error occurred loading your record: {uiState.status}</p>
		<div>
			<Button color="primary" className="mt-4" onClick={handleBack}>
			<FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
				<span className="mr-2">Back</span>
			</Button>
		</div>
	</div>

	return <div>
		<h4>{provider.name}</h4>
		{ uiState.submode === "authorizing" && renderWorking("Waiting for Portal Login...") }
		{ uiState.submode === "loading" && renderWorking("Retrieving Healthcare Records...") }
		{ uiState.submode === "error" && renderGlobalError() }
	</div>


}