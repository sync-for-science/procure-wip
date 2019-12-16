/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, { useState, useEffect, useRef, useCallback } from "react";
import useStoreon from "storeon/react";
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormText, FormFeedback} from 'reactstrap';
import Select, { createFilter } from "react-select";

export default () => {

	//app state
	const {
		uiState, providers, queryProfiles, credentials,
		organizations, orgDefaults, redirectUri, dispatch
	 } = useStoreon(
		"uiState", "providers", "queryProfiles", "credentials",
		"organizations", "orgDefaults", "redirectUri"
	 );

	//component state
	const [provider, setProvider] = useState({});
	const [validation, setValidation] = useState({});
	const [showDetails, setShowDetails] = useState(false);
	const [orgOptions] = useState( () => {
		let orgs = organizations
			.map( o => ({label: o.name, value: o.orgId || o.fhirEndpoint}) )
			.sort( o => o.label );
		return [{label: "Custom Endpoint", value: "custom"}].concat(orgs);
	});

	const orgRef = useRef(null)
	useEffect(() => orgRef.current.focus(), []);


	const handleCancel = useCallback( e => {
		e.preventDefault();
		dispatch("uiState/set", {mode: "ready"});
	}, [dispatch]);

	//escape key effect
	//creates a warning due to a reactjs bug: https://github.com/facebook/react/pull/15650 
	useEffect(() => {
		const downHandler = e => {
			if (e.keyCode === 27) handleCancel(e);
		};
		window.addEventListener("keydown", downHandler);
		return () => {
			window.removeEventListener("keydown", downHandler);
		};
	}, [handleCancel]);

	useEffect( () => {
		if (!provider.id && uiState.id && uiState.mode === "editProvider") {
			const currentProvider = providers.find(p => p.id === uiState.id);
			setProvider(currentProvider)
			setValidation({});
			setShowDetails(currentProvider && currentProvider.orgId === "custom");
		}
	}, [uiState.id, uiState.mode, provider.id, providers])

	const handleSubmit = (e, skipRefresh) => {
		e.preventDefault();

		const errors = validate(provider);
		if (errors) return setValidation(errors);

		if (skipRefresh) {
			dispatch("providers/upsert", provider);
			dispatch("uiState/set", {mode: "ready"});
		} else {
			dispatch("providers/upsertAndLoad", provider);
		}
		dispatch("refreshDirty");
	}

	const handleOrgSelection = (selection) => {
		let orgConfig;
		//get default details
		if (selection.value !== "custom") {
			orgConfig = organizations.find( o => selection.value === o.orgId || selection.value === o.fhirEndpoint );
			const defaults = orgDefaults[orgConfig.defaultId] || {};
			if (orgConfig.defaultId !== undefined) orgConfig = {...defaults, ...orgConfig};
		} else {
			orgConfig = {
				name: selection.label,
				scope: ["patient/*.read", "launch/patient"],
			}
		}
		//get credential details if included by reference
		if (orgConfig.credentialId)
			orgConfig = {...credentials[orgConfig.credentialId], ...orgConfig};

		//update provider with new defaults
		const updatedProvider = {
			...orgConfig,
			redirectUri,
			id: provider.id,
			orgId: selection.value
		}
		//show form if there's any missing data
		setShowDetails(validate(updatedProvider));
		setProvider(updatedProvider);
	}

	const validate = (provider) => {
		let validation = {};
		const isInvalidUrl = (url) => !/^https?:\/\//.test(url.toLowerCase());

		if (provider.isOpen) {
			["name", "patient"].forEach( f => { if (!provider[f]) validation[f] = "Required" })
		} else {
			["name", "clientId", "scope"].forEach( f => { if (!provider[f]) validation[f] = "Required" })
		}

		if (isInvalidUrl(provider.fhirEndpoint || ""))
			validation.fhirEndpoint = "Valid URL Required";
		
		if (!provider.isOpen && isInvalidUrl(provider.redirectUri || ""))
			validation.redirectUri = "Valid URL Required";

		return Object.keys(validation).length > 0 ? validation : null;
	}

	const renderOrgSelector = () => {
		//workaround since component uses both the value and label to match and we just want to store the value
		const value = provider.orgId ? orgOptions.find(o => o.value === provider.orgId) : null;

		return <FormGroup>
			<Label for="organization">Healthcare Organization</Label>
			<Select id="organization" ref={orgRef}
				//performance improvement on autocomplete
				filterOption={createFilter({ignoreAccents: false})}
				value={value}
				onChange={handleOrgSelection}
				isSearchable={true}
				options={orgOptions}
			/>
		</FormGroup>
	}

	const renderTextInput = (title, property, type, isRequired, instructions, valueFn, onChangeFn) => {
		const formText = instructions ? <FormText color="muted">{instructions}</FormText> : "";
		const errorText = validation[property] ? <FormFeedback>{validation[property]}</FormFeedback> : "";
		const onChange = onChangeFn || ( e => {setProvider({...provider, [property]: e.target.value}) });
		return <FormGroup>
			<Label for="{property}">{title}</Label>
			<Input
				value={valueFn ? valueFn() : provider[property] || ""}
				type={type || "text"}
				id={property}
				onChange={onChange}
				invalid={validation[property] ? true : false}
				required={isRequired}
			/>
			{formText}
			{errorText}
		</FormGroup>
	}	

	const renderProfileSelector = () => {
		const profileOptions = Object.keys(queryProfiles).map(q => {
			return <option value={q} key={q}>{queryProfiles[q].title}</option>
		});

		return <FormGroup>
			<Label for="profile">Profile</Label>
			<Input type="select"
				value={provider.queryProfile || "argonaut_spec"}
				onChange={ e=> setProvider({...provider, queryProfile: e.target.value}) }
				name="profile"
			> {profileOptions} </Input>
		</FormGroup>
	}

	const openCheckbox = <FormGroup check>
		<Input type="checkbox"
			id="isOpen"
			checked={provider.isOpen === true || provider.isOpen === "true" || false}
			onChange={e => setProvider({...provider, isOpen:!provider.isOpen})}
		/>
		<Label for="isOpen">Open Endpoint</Label>
	</FormGroup>

	const detailsLink = <FormGroup>
		<a href="#" onClick={e => setShowDetails(true)} >
			{"Show Configuration Details"}
		</a>
	</FormGroup>

	const shortForm = <>
		{ renderOrgSelector() }
		{ renderTextInput("Title", "name", "text", true) }
	</>

	const openDetails = <>
		{ renderTextInput("FHIR Endpoint URL", "fhirEndpoint", "url", true) }
		{ openCheckbox }
		{ renderProfileSelector() }
		{ renderTextInput("Patient Id", "patient", "text", true)}
	</>
	
	const secureDetails =  <>
		{ renderTextInput("FHIR Endpoint URL", "fhirEndpoint", "url", true) }
		{ openCheckbox }
		{ renderProfileSelector() }
		{ renderTextInput("Client Id", "clientId", "text", true) }
		{ renderTextInput("Client Secret (if applicable)", "clientSecret", "text", true) }
		{ renderTextInput("Redirect URL", "redirectUri", "url", true) }
		{ renderTextInput(
			"Scope", "scope", "text", true,  "separate scopes with spaces",
			() => (provider.scope || []).join(" "),
			e => setProvider({...provider, scope: e.target.value.split(/\s+/)})
		)}
	</>

	return  <Modal isOpen={true} fade={false} backdrop={true}>
		<ModalHeader>{provider.id ? "Update Provider" : "Add Provider"} </ModalHeader>
		<ModalBody><Form onSubmit={handleSubmit} className="needs-validation" noValidate>
			{ shortForm }
			{ !showDetails && provider.orgId ? detailsLink : null }
			{ showDetails && provider.isOpen ? openDetails : null }
			{ showDetails && !provider.isOpen ? secureDetails : null }
		</Form></ModalBody>
		<ModalFooter>
			<div className="mr-auto"><a href="#" onClick={handleCancel}>Cancel</a></div>
			<Button color="outline-secondary" onClick={e => handleSubmit(e, true)}>Save</Button>
			<Button color="primary" style={{marginLeft: "1em"}} onClick={handleSubmit}>Save and Load Records</Button>
		</ModalFooter>
	</Modal>

}