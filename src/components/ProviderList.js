/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React from "react";
import useStoreon from "storeon/react";
import TimeAgo from "./TimeAgo"
import { Spinner } from "reactstrap";

export default () => {

	const { providers, dispatch } = useStoreon("providers");

	if (!providers.length) return null;

	const handleDeleteProvider = (id, e) => {
		e.preventDefault();
		dispatch("providers/remove", id);
	}

	const handleEditProvider = (id, e) => {
		e.preventDefault();
		dispatch("uiState/set", {
			mode: "editProvider", id
		});
	}

	const handleExportProvider = (id, e) => {
		e.preventDefault();
		dispatch("export/download", id);
	}

	const handleLoadRecords = (id, e) => {
		e.preventDefault();
		dispatch("fhir/loadData", id);
	}

	const pluralizeEn = (text, len) => len === 1 ? text : text+"s";

	const renderCard = (provider) => {

		const renderDataDetails = () => <p>	
			{ provider.data.entry.length} { pluralizeEn("resource", provider.data.entry.length) }<br />
			<i>Loaded <TimeAgo time={provider.lastUpdated} /></i>
		</p>

		const renderControls = () => {
			const downloadLink = <span>
				&nbsp;|&nbsp;
				<a href="#" onClick={e => handleExportProvider(provider.id, e)}>download data</a>
			</span>

			return <div>
				<a href="#" 
					className="card-link" 
					onClick={e => handleDeleteProvider(provider.id, e)}>
					delete
				</a>
				<span>
					&nbsp;|&nbsp;
					<a href="#" 
					onClick={e => handleEditProvider(provider.id, e)}>edit</a>
				</span>
				<span>
					&nbsp;|&nbsp;
					<a href="#" 
						style={{fontWeight: !provider.lastUpdated ? "bold" : "normal"}}
						onClick={e => handleLoadRecords(provider.id, e)}>
						{provider.lastUpdated ? "re" : ""}load records
					</a>
				</span>
				{ (provider.lastUpdated && provider.data.entry.length && downloadLink) || "" }
			</div>
		}

		const downloading = <div>
			<Spinner size="sm" /> Generating Download
		</div>;

		return <div className="card" style={{marginBottom:"1em"}} key={provider.id}>
			<div className="card-body">
				<h5 className="card-title">{provider.name}</h5>
				<div className="card-text">
					{ provider.lastUpdated && renderDataDetails() }
					{ provider.uiStatus !== "downloading" ? renderControls() : downloading }			
				</div>
			</div>
		</div>

	};

	return <div>
		<h3 style={{margin:"1em 0"}}>My Providers</h3>
		{ providers.map(renderCard) }
	</div>

}