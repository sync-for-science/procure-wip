/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, { useState, useMemo, useRef } from "react";
import useStoreon from "storeon/react";
import Select from "react-select";
import JSONTree from "react-json-tree";
import {FormGroup, Button} from "reactstrap";
import _ from "lodash";
import { saveAs } from "file-saver";

export default () => {
	
	//app state
	const { providers } = useStoreon("providers");

	//component state
	const [provider, setProvider] = useState([]);
	const [resourceType, setResourceType] = useState();
	const [position, setPosition] = useState(1);
	const [overlayResources, setOverlayResources] = useState([]);

	const componentTopRef = useRef();

	let providerOptions = useMemo( () => {
		return _.chain(providers)
			.filter( p => p.data && p.data.entry.length > 0 )
			.map( p => ({label: p.name, value: p.id}) )
			.value();
		}, [providers]);

	let resourceTypeOptions = useMemo( () => {
		return _.chain(providers)
			.filter( p => p.data && (!provider.length || provider.find( p2 => p2.value === p.id )) )
			.map( p => p.data.entry.map(e => e.resource.resourceType) )
			.flatten().uniq()
			.map(o => ({label: o, value: o}))
			.value();
	}, [providerOptions, provider]);

	let resources = useMemo( () => {
		return _.chain(providers)
			.filter( p => {
				return (!provider.length && p.data && p.data.entry.length) ||
					provider.find( p2 => p2.value === p.id )
			})
			.map( p => p.data.entry ).flatten()
			.filter( e => (!resourceType || resourceType.value === e.resource.resourceType) )
			.value();
	}, [providers, provider, resourceType]);


	//remove leading slashes, trailing slashes and protocol
	const simplifyUrl = (url) => url.replace(/^\/|https?:\/\/|\/*$/g, "")

	const referenceIndex = useMemo( () => {
		let index = {};
		_.each(providers, (provider, i) => {
			_.each(((provider.data && provider.data.entry) || []), (entry, j) => {
				index[simplifyUrl(entry.fullUrl)] = [i, j, "resource"]
			})
			_.each(((provider.data && provider.data.files) || []), (file, j) => {
				index[file.fileName] = [i, j, "file"]
			})		
		});
		return index;
	}, [providers]);

	if (!providerOptions.length) return null;


	const handlePosChange = (dir, e) => {
		e.preventDefault();
		setPosition(position+dir);
	}

	const filters = <> 
		<FormGroup>
			<Select id="provider"
				value={provider}
				onChange={selection => {setProvider(selection); setPosition(1); setOverlayResources([]);} }
				isSearchable={true}
				options={providerOptions}
				placeholder="Filter by Provider"
				isMulti={true}
			/>
		</FormGroup><FormGroup>
			<Select id="resourceType"
				value={resourceType}
				onChange={ selection => {setResourceType(selection); setPosition(1);setOverlayResources([]);} }
				isSearchable={true}
				options={ resourceTypeOptions }
				placeholder="Filter by Resource Type"
				isClearable={true}
			/>
		</FormGroup>
	</>

	const renderPositionNav = () => {
		const noResources = <div className="text-center">
			No resources found
		</div>;
				
		const nextPrevNav = <div>
			<Button size="sm" outline={true} color="primary" disabled={position === 1} onClick={e => handlePosChange(-1, e)}>&lt;</Button>
			&nbsp;&nbsp;Resource {position} of {resources.length}&nbsp;&nbsp;
			<Button size="sm" outline={true} color="primary" disabled={position === resources.length} onClick={e => handlePosChange(1, e)}>&gt;</Button>
		</div>;

		const overlayNav = <div>
			<Button size="sm" outline={true} color="primary" onClick={e => {
				setOverlayResources(_.slice(overlayResources, 0, -1))
			}}>
				&lt;&nbsp;Back
			</Button>
		</div>;

		if (overlayResources.length) {
			return overlayNav;
		} else if (resources.length) {
			return nextPrevNav;
		} else {
			return noResources;
		}

	}

	const treeTheme = {
		base00: '#272822',base01: '#383830',base02: '#49483e',base03: '#75715e',
		base04: '#a59f85',base05: '#f8f8f2',base06: '#f5f4f1',base07: '#f9f8f5',
		base08: '#f92672',base09: '#fd971f',base0A: '#f4bf75',base0B: '#a6e22e',
		base0C: '#a1efe4',base0D: '#66d9ef',base0E: '#ae81ff',base0F: '#cc6633'
	};

	const handleReference = (url, e) => {
		e.preventDefault();
		const index = referenceIndex[url];
		if (index[2] === "file") {
			const file = providers[index[0]].data.files[index[1]];
			saveAs(file.blob, file.fileName);
		} else {
			setOverlayResources([...overlayResources, url]);
			window.scrollTo(0, componentTopRef.current.offsetTop);
		}
	}

	const valueRenderer = (raw, value, key) => {
		let link;

		if (key === "reference") {
			//remove leading and trailing slashes
			let refUrl = simplifyUrl(value);

			//add base url if relative path
			if ((refUrl.match(/\//g) || []).length === 1) {
				const fullUrl =
					(overlayResources.length && _.last(overlayResources).fullUrl) ||
					resources[position-1].fullUrl;
				const baseUrl = simplifyUrl(fullUrl).split("/");
				refUrl = baseUrl
					.slice(0, baseUrl.length-2).join("/") + "/" + refUrl;
			}
			if (referenceIndex[refUrl]) link = refUrl;
		//this could be optimized by only looking at attachment keys
		} else if (key === "url" && referenceIndex[value]) {
			link = value;
		//truncate very long values
		} else if (value.length > 500) {
			raw = value.substring(0,500) + "...";
		}

		return link ? <span>
			"<a href="#" style={{textDecoration: "underline"}}
			onClick={e => handleReference(link, e)}
			>{value}</a>"
		</span> : raw;
	}

	const getResourceByUrl = (url) => {
		const index = referenceIndex[url];
		if (index) return providers[index[0]].data.entry[index[1]];
	}

	const renderJsonTree = () => {

		const overlayData = overlayResources.length && getResourceByUrl(_.last(overlayResources))
		if (overlayResources.length && !overlayData) 
			setOverlayResources(_.slice(overlayResources, 1,-1));	
		const data = (
			overlayData && overlayData.resource
		) || (
			resources[position-1] && resources[position-1].resource
		);
		
		if (data) return <div style={{
			marginTop: "1rem", padding: "1rem", 
			border: "1px solid #ccc", borderRadius: ".25rem", 
			background: "#fffffa"
		}}>
			<JSONTree 
				data={data} 
				theme={treeTheme} 
				hideRoot={true} 
				shouldExpandNode={(keyName, data, level) => true}
				invertTheme={true}
				valueRenderer={valueRenderer}
			/>
		</div>;
	}

	return <div ref={componentTopRef}>
		<h3 style={{margin:"1em 0"}}>Browse Data</h3>
		{ filters }
		{ renderPositionNav() }
		{ renderJsonTree() }
		</div>
}