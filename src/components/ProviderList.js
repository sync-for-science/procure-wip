/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React from "react";
import useStoreon from "storeon/react";
import TimeAgo from "./TimeAgo"
import { Button, CardBody, Card, Row, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faTrash, faEdit, faCheckSquare } from "@fortawesome/free-solid-svg-icons"
import { faSquare } from "@fortawesome/free-regular-svg-icons"

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

	const handleLoadRecords = (id, e) => {
		e.preventDefault();
		dispatch("fhir/loadData", id);
	}

	const handleAddProvider = (e) => {
		e.preventDefault();
		dispatch("uiState/set", {mode: "editProvider"});
	}

	const toggleProviderSelection = (id, newValue, e) => {
		dispatch("providers/update", {
			id: id, selected: newValue
		});
	}

	const pluralizeEn = (text, len) => len === 1 ? text : text+"s";

	const renderCard = (provider) => {

		const renderDataDetails = () => <p>	
			{ provider.data.entry.length} { pluralizeEn("resource", provider.data.entry.length) }
			<span>&nbsp;(loaded <TimeAgo time={provider.lastUpdated} />)</span>
		</p>

		const controls = <div>
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
		</div>

		return <Card style={{margin:"0 1rem 1rem 0"}} key={provider.id}>
			<CardBody><Row>
				<Col xs={{size: "auto"}} className="mr-0 pr-1 text-center">
					<div>
						<input type="checkbox"
							style={{visibility: "hidden", width:0, height:0}}
							checked={!!provider.selected} 
							id={"selection-"+ provider.id}
							onChange={e => toggleProviderSelection(provider.id, !provider.selected)} 
						/>
						<label htmlFor={"selection-"+ provider.id}>
							<FontAwesomeIcon icon={!!provider.selected ? faCheckSquare : faSquare} size="lg" color={!!provider.selected ? "green" : "black"} />
						</label>
					</div>
				</Col><Col>
					<p className="font-weight-bold" 
						style={{marginBottom: ".25rem", cursor: "pointer", display:"inline-block"}}
						onClick={e => toggleProviderSelection(provider.id, !provider.selected, e)}
					>
						{provider.name}
					</p>
						{ provider.lastUpdated && renderDataDetails() }
						{ controls }
				</Col>
			</Row></CardBody>
		</Card>

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