/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React from "react";
import { Button } from 'reactstrap';
import useStoreon from "storeon/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import DownloadButton from "./DownloadButton";
import _ from "lodash";

export default () => {

	const {providers, upload, dispatch} = useStoreon("providers", "upload");

	const handleAddProvider = e => {
		e.preventDefault();
		dispatch("uiState/set", {mode: "editProvider"});
	}
	const handleFileUpload = e => {
		e.preventDefault()
		dispatch("export/upload/send");
	}

	const handleDeleteProvider = (id, e) => {
		e.preventDefault();
		dispatch("providers/remove", id);
		dispatch("refreshDirty");
	}

	const renderProvider = (provider) => {
		return <li key={provider.id}>
			{provider.name}{" "}
			(<a href="#" onClick={e => handleDeleteProvider(provider.id, e)}>remove</a>)
		</li>
	};

	const providerList = _.chain(providers)
		.sortBy( p => p.lastUpdated)
		.map(renderProvider)
		.concat(<li key="add"><a href="#" onClick={handleAddProvider}>Add another provider</a></li>)
		.value();

	return <div className="p-2">
		<h4 className="mb-4">Review Data to Share</h4>
		<p>You have collected records from the following healthcare providers:</p>
		<ul>{ providerList }</ul>
		<DownloadButton className="float-left mt-4" />
		<Button color="success" className="float-right mt-4" 
			disabled={providerList.length === 1}
			onClick={handleFileUpload}
		>
			<span className="mr-2">Share with {upload.name}</span>
			<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
		</Button>
		<div className="clearfix"></div>
	</div>

}