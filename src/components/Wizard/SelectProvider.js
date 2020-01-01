import React, { useState, useEffect, useRef } from "react";
import useStoreon from "storeon/react";
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import Select, { createFilter } from "react-select";
import _ from "lodash";

export default () => {

	//app state
	const {
		uiState, providers, credentials,
		organizations, redirectUri, dispatch
	 } = useStoreon(
		"uiState", "providers", "credentials",
		"organizations", "redirectUri"
	 );

	//component state
	const [provider, setProvider] = useState({});	

	const orgOptions = _.chain(organizations)
		.map( o => ({label: o.name, value: o.orgId || o.fhirEndpoint}) )
		.sortBy( o => o.label )
		.value();

	const orgRef = useRef(null)
	useEffect(() => orgRef.current.focus(), []);

	useEffect( () => {
		if (!provider.id && uiState.id && uiState.mode === "editProvider") {
			const currentProvider = providers.find(p => p.id === uiState.id);
			setProvider(currentProvider)
		}
	}, [uiState.id, uiState.mode, provider.id, providers])

	const handleSubmit = e => {
		e.preventDefault();
		dispatch("providers/upsertAndLoad", provider);
		dispatch("refreshDirty");
	}

	const handleOrgSelection = (selection) => {
		let orgConfig = organizations.find( 
			o => selection.value === o.orgId || selection.value === o.fhirEndpoint
		);

		//get credential details if included by reference
		if (orgConfig.credentialId)
			orgConfig = {...credentials[orgConfig.credentialId], ...orgConfig};

		//update provider with new defaults
		setProvider({
			...orgConfig,
			redirectUri,
			id: provider.id,
			orgId: selection.value,
			queryProfile: orgConfig.queryProfile || "argonaut_spec"
		});
	}

	const renderOrgSelector = () => {

		//workaround since component uses both the value and label to match and we just want to store the value
		const value = provider.orgId ? orgOptions.find(o => o.value === provider.orgId) : null;

		return <Select id="organization" ref={orgRef}
				//performance improvement on autocomplete
				filterOption={createFilter({ignoreAccents: false})}
				value={value}
				onChange={handleOrgSelection}
				isSearchable={true}
				options={orgOptions}
				defaultMenuIsOpen={true}
			/>
	}

	return <div className="p-2">
		<h4 className="mb-4">Select Your Provider</h4>
		<p>
			Choose a healthcare institution where you've received care from the list below.
		</p><p>
			If you've been to multiple healthcare providers, after retrieving your records you'll have the option to return to this screen to select another institution.
		</p>
		{ renderOrgSelector() }
		<Button color="success" className="float-right mt-4"
			onClick={ handleSubmit } 
			disabled={provider.orgId ? false :true}
		>
			<span className="mr-2">Login to Patient Portal</span>
			<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
		</Button>
		<div className="clearfix"></div>
	</div>
}