/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React from "react";
import useStoreon from "storeon/react";
import TimeAgo from "./TimeAgo"
import { Spinner, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons"

export default () => {

	const { providers, dispatch } = useStoreon("providers");

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

	const handleAddProvider = (e) => {
		e.preventDefault();
		dispatch("uiState/set", {mode: "editProvider"});
	}

	const pluralizeEn = (text, len) => len === 1 ? text : text+"s";

	const renderCard = (provider) => {

		const renderDataDetails = () => <p>	
			{ provider.data.entry.length} { pluralizeEn("resource", provider.data.entry.length) }
			<span>&nbsp;(loaded <TimeAgo time={provider.lastUpdated} />)</span>
		</p>

		const renderControls = () => {
			const downloadLink = <span>
				&nbsp;|&nbsp;
				<a href="#" onClick={e => handleExportProvider(provider.id, e)}>download data</a>
			</span>

			return <div>
				<div className="float-right">
					<a href="#" 
						onClick={e => handleEditProvider(provider.id, e)}
						title="Edit Provider"
					>
						<FontAwesomeIcon icon={faEdit} color="#6c757d" className="mx-2" />
					</a>

					<a href="#" 
						onClick={e => handleDeleteProvider(provider.id, e)}
						title="Delete Provider"
					>
						<FontAwesomeIcon icon={faTrash} color="#6c757d" className="mx-2" />
					</a>

				</div>

				<a href="#" 
					style={{fontWeight: !provider.lastUpdated ? "bold" : "normal"}}
					onClick={e => handleLoadRecords(provider.id, e)}>
					{provider.lastUpdated ? "re" : ""}load records
				</a>
				{ (provider.lastUpdated && provider.data.entry.length && downloadLink) || "" }
			</div>
		}

		const downloading = <div>
			<Spinner size="sm" /> Generating Download
		</div>;

		return <div className="card" style={{margin:"0 1rem 1rem 0"}} key={provider.id}>
			<div className="card-body">
				<p className="font-weight-bold" style={{marginBottom: "0.25rem"}}>{provider.name}</p>
				<div className="">
					{ provider.lastUpdated && renderDataDetails() }
					{ provider.uiStatus !== "downloading" ? renderControls() : downloading }			
				</div>
			</div>
		</div>

	};

	return <div>
		<div style={{marginBottom: "1.5rem"}}>
			<Button color="success"
				style={{marginRight: "1rem"}}
				onClick={handleAddProvider}
			>
				<FontAwesomeIcon icon={faPlus} className="mr-2" />
				Add Provider
			</Button>	
		</div>
		{ providers.map(renderCard) }
	</div>

}