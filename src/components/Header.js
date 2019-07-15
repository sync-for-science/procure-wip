/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, {useRef} from "react";
import useStoreon from "storeon/react";
import {Navbar, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap';
import SettingsImportDropZone from "./SettingsImportDropZone";

export default () => {

	const { providers, dispatch } = useStoreon("providers");
	const fileInput = useRef();

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
		if (replace) dispatch("import/settings", file);
	}

	return 	<SettingsImportDropZone fileDropHandler={readFile}>
		<input ref={fileInput}
				type="file" 
				style={{display: 'none'}}
				onChange={handleFileSelected}
				accept=".json, application/json"
		/>
		<Navbar color="light" light expand="xs">
			<NavbarBrand href="/">Procure</NavbarBrand>
			<Nav className="ml-auto" navbar>
				<NavItem>
					<NavLink href="#" onClick={handleImportSettings}>import settings</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="#" onClick={handleDownloadSettings}>export settings</NavLink>
				</NavItem>
			</Nav>
		</Navbar>
	</SettingsImportDropZone>


}