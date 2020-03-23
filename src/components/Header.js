/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, {useRef, useEffect} from "react";
import useStoreon from "storeon/react";
import {Navbar, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap';
import SettingsImportDropZone from "./SettingsImportDropZone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMedkit } from "@fortawesome/free-solid-svg-icons"

export default () => {

	const { providers, isDirty, warnOnPageNavigate, appName, dispatch } = useStoreon("providers", "isDirty", "warnOnPageNavigate", "appName");
	const fileInput = useRef();

	useEffect( () => {
		window.onbeforeunload = () => (isDirty && warnOnPageNavigate) ? true : null;
	});

	const handleImportSettings = e => {
		e.preventDefault();
		fileInput.current.value = "";
		fileInput.current.click();
	}

	const handleFileSelected = e => {
		e.preventDefault();
		e.stopPropagation();
		if (e.target.files.length === 1)
			readFile(e.target.files[0]);
	}

	const handleDownloadSettings = e => {
		e.preventDefault();
		dispatch("export/settings");
	}

	const readFile = (file) => {
		const replace = providers.length === 0 || window.confirm(
			"Current providers in your list will be replaced. Continue?"
		)
		if (replace) {
			dispatch("import/settings", file)
			dispatch("refreshDirty", true);
		};
	}

	return <div style={{marginBottom: "2rem"}}><SettingsImportDropZone fileDropHandler={readFile}>
		<input ref={fileInput}
				type="file" 
				style={{display: 'none'}}
				onChange={handleFileSelected}
				accept=".json, application/json"
		/>
		<Navbar color="light" light expand="xs">
			<NavbarBrand href="/">
				<FontAwesomeIcon icon={faMedkit} alt="Procure logo" className="mr-2" />
				{appName || "Procure"}
			</NavbarBrand>
			<Nav className="ml-auto" navbar>
				<NavItem>
					<NavLink href="#" onClick={handleImportSettings}>import settings</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="#" onClick={handleDownloadSettings} style={{fontWeight: isDirty ? "bold" : "normal"}}>
						export settings
					</NavLink>
				</NavItem>
			</Nav>
		</Navbar>
	</SettingsImportDropZone></div> 


}