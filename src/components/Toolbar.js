import React, {useState} from "react";
import {Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import useStoreon from "storeon/react";

export default () => {

	const { 
		providers, spreadsheetTemplates,
		nonModalUi, dispatch 
	} = useStoreon(
		"providers", "spreadsheetTemplates", "nonModalUi"
	);
	
	const [showSpreadsheetOptions, setShowSpreadsheetOptions] = useState(false);

	const handleAddProvider = (e) => {
		e.preventDefault();
		dispatch("uiState/set", {mode: "editProvider"});
	}

	const handleExportData = (e) => {		
		e.preventDefault();
		dispatch("export/downloadAll", {mode: "editProvider"});
	}

	const handleShowGithubExport = (e) => {
		e.preventDefault()
		dispatch("uiState/set", {mode: "githubExport"});
	}

	const handelExportSpreadsheet = (templateId, format, e) => {
		e.preventDefault()
		dispatch("export/spreadsheet", {templateId, format});
	}

	const resourceCount = providers.find(p => p.data && p.data.entry.length);
	
	const renderSpreadsheetExport = () => {
		if (!Object.keys(spreadsheetTemplates||{}).length) 
			return null;
		let menuItems = [];
		Object.keys(spreadsheetTemplates).forEach( templateId => {
			menuItems.push(
				<DropdownItem 
					key={templateId + "-xlsx"} 
					onClick={handelExportSpreadsheet.bind(this, templateId, "xlsx")}
				>
					{spreadsheetTemplates[templateId].name + " (Excel)"}
				</DropdownItem>,
				<DropdownItem 
					key={templateId + "-csv"}
					onClick={handelExportSpreadsheet.bind(this, templateId, "csv")}
				>
					{spreadsheetTemplates[templateId].name + " (CSV)"}
				</DropdownItem>
			)
		});
		return <Dropdown 
			style={{display: "inline"}}
			disabled={nonModalUi.isExportingSheet}
			isOpen={showSpreadsheetOptions}
			toggle={e => setShowSpreadsheetOptions(!showSpreadsheetOptions)}
		>
			<DropdownToggle 
				color="outline-secondary" 
				style={{marginRight: "1em", marginTop: "1em"}}
				caret
			>
				Export Spreadsheet&nbsp;
			</DropdownToggle>
			<DropdownMenu>{menuItems}</DropdownMenu>
		</Dropdown>
	}

	const downloadAllButton = <Button 
		color="outline-secondary"
		style={{marginRight: "1em", marginTop: "1em"}}
		onClick={handleExportData}
		disabled={nonModalUi.isDownloading}
		> Download All Data
	</Button>;

	const ghExportButton = <Button 
		color="outline-secondary"
		style={{marginTop: "1em"}}
		onClick={handleShowGithubExport}
		> Export to Github
	</Button>;

	return <div style={{margin: "1em 0"}}>
		<Button color="success" 
			style={{marginRight: "1em", marginTop: "1em"}}
			onClick={handleAddProvider}
		>Add Provider</Button>
		{resourceCount && downloadAllButton}
		{resourceCount && renderSpreadsheetExport()}
		{resourceCount && ghExportButton}
	</div>

}