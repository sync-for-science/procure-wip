/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, {useState} from "react";
import {Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import useStoreon from "storeon/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTable, faFileDownload, faFileUpload, faTrash } from "@fortawesome/free-solid-svg-icons"

export default (props) => {

	const { 
		spreadsheetTemplates,
		providers,
		upload,
		nonModalUi,
		dispatch
	} = useStoreon(
		"spreadsheetTemplates",
		"providers",
		"upload",
		"nonModalUi"
	);

	const [showDownloadOptions, setShowDownloadOptions] = useState(false);

	const handleDeleteProvider = (id, e) => {
		e.preventDefault();
		dispatch("providers/remove", id);
		dispatch("refreshDirty");
	}

	const handleAddProvider = (e) => {
		e.preventDefault();
		dispatch("uiState/set", {mode: "editProvider"});
	}

	const handelExportSpreadsheet = (templateId, format, e) => {
		e.preventDefault()
		dispatch("export/spreadsheet", {templateId, format});
	}

	const handleExportData = (e) => {		
		e.preventDefault();
		dispatch("export/download");
	}

	const handleFileUpload = (e) => {
		e.preventDefault()
		dispatch("export/upload");
	}

	const pluralizeEn = (text, len) => len === 1 ? text : text+"s";

	const renderProvider = (provider) => {
		
		return <div key={provider.id}>{provider.name}</div>

		const renderDataDetails = () => <p>	
			{ provider.data.entry.length} { pluralizeEn("resource", provider.data.entry.length) }{" | "}
			{ provider.data.files.length} { pluralizeEn("file", provider.data.files.length) }{" | "}
			{ provider.data.errorLog.length} { pluralizeEn("error", provider.data.errorLog.length) }
		</p>

		return <div key={provider.id}>
			{provider.name}
			<div className="float-right">
				<a href="#" 
					onClick={e => handleDeleteProvider(provider.id, e)}
					title="Delete Provider"
				>
					<FontAwesomeIcon icon={faTrash} color="#6c757d" className="mx-2" />
				</a>
			</div>
		</div>

	};

	const renderDownloadButton = () => {

		let menuItems = [
			<DropdownItem 
				key="fhir" 
				onClick={handleExportData}
			>FHIR Format</DropdownItem>
		];

		(Object.keys(spreadsheetTemplates) || []).forEach( templateId => {
			menuItems.push(
				<DropdownItem 
					key={templateId + "-xlsx"} 
					onClick={handelExportSpreadsheet.bind(this, templateId, "xlsx")}
				>
					Spreadsheet - {spreadsheetTemplates[templateId].name}
				</DropdownItem>
			)
		});

		return <Dropdown 
			style={{display: "inline",}}
			disabled={nonModalUi.isExportingSheet}
			isOpen={showDownloadOptions}
			toggle={e => setShowDownloadOptions(!showDownloadOptions)}
		>
			<DropdownToggle 
				color="outline-secondary" 
				style={{margin: "0 1rem 1rem 0"}}
				caret
			>
			<FontAwesomeIcon icon={faFileDownload} className="mr-2" />
				<span className="mr-2">Download Raw Data</span>
			</DropdownToggle>
			<DropdownMenu>{menuItems}</DropdownMenu>
		</Dropdown>
	}


	return <div>
		<h2>Confirm Upload</h2>
		{ providers.map(renderProvider) }
		{renderDownloadButton()}
		<Button onClick={handleAddProvider}>Back</Button>
		<Button onClick={handleFileUpload}>{upload.label}</Button>
	</div>

}