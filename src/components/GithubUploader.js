/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React, { useState } from "react";
import useStoreon from "storeon/react";
import {
	Button, Spinner, Col, Row, 
	Form, FormGroup, Modal, ModalHeader, 
	ModalBody, ModalFooter, Label, 
	Input, Container, Alert
} from 'reactstrap';

export default () => {

	//app state
	const {uiState, githubConfig, dispatch} = useStoreon("uiState", "githubConfig");

	//component state
	const [showInstructions, setShowInstructions] = useState();

	const handleSubmit = e => {
		e.preventDefault()
		if (!githubConfig.token || !githubConfig.owner || !githubConfig.project) {
			dispatch("uiState/merge", {
				error: "Please enter a personal access token, repository owner and repository project to continue."
			});
		} else {
			dispatch("export/github");
		}
	}

	const handleFieldChange = (fieldName, e) => {
		const value = fieldName === "pullRequest"
			? e.target.value === "true"
			: e.target.value;
		dispatch("config/merge", {
			githubConfig: {
				...githubConfig, [fieldName]: value
			}
		});
		dispatch("uiState/merge", {
			status: null,
			error: null
		})
	}

	const handleHideDialog = e => {
		if (e) e.preventDefault()
		dispatch("uiState/set", {state: "ready"})
	}

	const handleCancelExport = e => {
		e.preventDefault()
		dispatch("export/github/cancel");
	}

	const handleToggleInstructions = e => {
		e.preventDefault();
		setShowInstructions(!showInstructions);
	}

	const renderLoading = () => <ModalBody className="text-center">
		<h5>
			{uiState.status}
		</h5>
		<div style={{padding: "1rem 0rem"}}>
			<Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
		</div>
		<div>
			<Button className="btn-primary" onClick={handleCancelExport}>Cancel</Button>
		</div>
	</ModalBody>

	const renderError = () => (
		<Row><Col xs={12}>
			<Container>
				<Alert color="danger">
					<span>{uiState.error.toString()}</span>
				</Alert>
			</Container>
		</Col></Row>
	);

	const renderMessage = () => (
		<Row><Col xs={12}>
			<Container>
				<Alert color="success">
					<span>{uiState.status}</span>
				</Alert>
			</Container>
		</Col></Row>
	);

	const renderForm = () => <Form onSubmit={handleSubmit}>
		<ModalBody>
			{ uiState.error && renderError() }
			{ uiState.status && renderMessage() }
			<Row form style={{margin: "1rem 0"}}><Col xs={12}>
					<div className="small float-right">
						<a href="#" onClick={handleToggleInstructions}>How do I get a token?</a>
					</div>
					<div id="token-instructions" style={{display: showInstructions ? "block" : "none", marginTop: "2rem"}}>
						To obtain a personal access token for your Github account:
						<ol>
							<li>Visit <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
								https://github.com/settings/tokens
							</a></li>
							<li>Click the "Generate new token" button in upper right corner of the page.</li>
							<li>Add a note to identify the token in case you want to revoke it later (eg. "Procure").</li>
							<li>Select permissions:
								<ul>
									<li>To push data to a public repository, check the <i>"public_repo"</i> item under <i>"repo"</i>.</li>
									<li>To push data to a private repository, check the <i>"repo"</i> item.</li>
								</ul>
							</li>
							<li>Click the "Generate token" button at the bottom of the page.</li>
						</ol>
					</div>
					<Label for="token">Personal Access Token</Label>
					<Input id="token" 
						value={(githubConfig && githubConfig.token) || ""} 
						onChange={ e => handleFieldChange("token", e) }
					/>

			</Col></Row>

			<Row form style={{margin: "1rem 0"}}><Col xs={12}>
				<Label for="repo">Repository</Label>
			</Col><Col xs={4}>
				<Input id="owner"
					value={(githubConfig && githubConfig.owner) || ""} 
					onChange={ e => handleFieldChange("owner", e) } 
					placeholder="Owner" data-lpignore="true"
				/>
			</Col><Col xs={1}>
			<Input readOnly className="form-control-plaintext" defaultValue="/" />
			</Col><Col xs={7}>
				<Input id="project" 
					value={(githubConfig && githubConfig.project) || ""} 
					onChange={ e => handleFieldChange("project", e) } 
					placeholder="Project" data-lpignore="true"
				/>
			</Col></Row>

			<Row form style={{margin: "2rem 0"}}><Col xs={12}>
				<FormGroup check>
					<Label check>
						<Input type="radio"
							name="pull-request"
							value={false}
							checked={!githubConfig.pullRequest}
							onChange={ e => handleFieldChange("pullRequest", e) }
						/>
						Commit directly to the master branch</Label>
				</FormGroup>
				<FormGroup check>
					<Label check>
						<Input type="radio"
							name="pull-request"
							value={true}
							checked={githubConfig.pullRequest === true}
							onChange={ e => handleFieldChange("pullRequest", e) }
						/>
						Create a new branch and pull request</Label>
				</FormGroup>
			</Col></Row>

		</ModalBody>
		<ModalFooter>
			<Button color="success" type="submit">Push Data</Button>
			<Button color="secondary" onClick={handleHideDialog}>Close</Button>
		</ModalFooter>
	</Form>
	
	return  <Modal isOpen={true} fade={false} backdrop={true}>
		<ModalHeader>Push to Github Repository</ModalHeader>
		{ uiState.submode === "push" ? renderLoading() : renderForm() }
	</Modal>

}