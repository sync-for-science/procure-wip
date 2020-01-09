import React, {useState} from "react";
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import useStoreon from "storeon/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileDownload } from "@fortawesome/free-solid-svg-icons"

export default (props) => {

	const { 
		spreadsheetTemplates,
		nonModalUi,
		dispatch
	} = useStoreon(
		"spreadsheetTemplates",
		"nonModalUi"
	);

	const [showDownloadOptions, setShowDownloadOptions] = useState(false);

	const handelExportSpreadsheet = (templateId, format, e) => {
		e.preventDefault()
		dispatch("export/spreadsheet", {templateId, format});
	}

	const handleExportData = (e) => {		
		e.preventDefault();
		dispatch("export/download");
	}

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
				Spreadsheet of {spreadsheetTemplates[templateId].name}
			</DropdownItem>
		)
	});

	return <Dropdown 
		className={props.className}
		style={{display: "inline",}}
		disabled={nonModalUi.isExportingSheet}
		isOpen={showDownloadOptions}
		toggle={e => setShowDownloadOptions(!showDownloadOptions)}
	>
		<DropdownToggle 
			color="outline-secondary" 
			style={{margin: "0 1rem 0 0"}}
			caret
		>
		<FontAwesomeIcon icon={faFileDownload} className="mr-2" />
			<span className="mr-2">Download copy of data</span>
		</DropdownToggle>
		<DropdownMenu>{menuItems}</DropdownMenu>
	</Dropdown>

}