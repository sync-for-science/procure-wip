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
		.value();

	return <div className="p-2">
		<h4 className="mb-4">Review Data to Share</h4>
		<p>You have collected records from the following healthcare providers:</p>
		<ul>{ providerList }</ul>

		<div className="d-md-flex">
			<div className="align-self-end flex-grow-1 mt-4">
				<DownloadButton />
			</div>
			<div>
				<Button color="success" 
					onClick={handleAddProvider}
					className="btn-block text-left mt-4"
				>
					<span className="mr-2">Add another provider</span>
					<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
				</Button>
				<Button color="success" 
					className="btn-block text-left mt-2"
					disabled={providerList.length === 0}
					onClick={handleFileUpload}
				>
					<span className="mr-2">Share with {upload.name}</span>
					<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
				</Button>
			</div>
			<div className="clear"></div>
		</div>


	</div>

}