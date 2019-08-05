/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React from "react";
import useStoreon from "storeon/react";
import {Alert, Container, Row, Col} from 'reactstrap';
import _ from "lodash";
import ProviderForm from "./ProviderForm";
import ProviderList from "./ProviderList";
import Fetcher from "./Fetcher";
import Loader from "./Loader"
import GithubUploader from "./GithubUploader";
import Header from "./Header";
import FhirTree from "./FhirTree";
import Toolbar from "./Toolbar";
import BlankSlate from "./BlankSlate";

const App = () =>  {

	//global state
	const { uiState, providers } = useStoreon("uiState", "providers");

	if (uiState.mode === "loading") 
		return <Loader />;

	if (uiState.mode === "globalError")
		return <Container style={{margin: "1em"}}>
			<Alert color="danger">
				<span>Failed to load configuration information.</span><br />
				<span>{uiState.error.toString()}</span>
			</Alert>
		</Container>;
	
	const inlineError = <Col xs="12" style={{margin: "0.5rem"}}>
		<Alert color="warning" style={{textAlign: "center"}}>{uiState.error}</Alert>
	</Col>

	const renderProviderList = () => <Col xs="12" md="6" lg="5" xl="4">
		<ProviderList />
	</Col>

	const renderData = () => <Col xs="12" md="6" lg="7" xl="8">
		<Toolbar  />
		<FhirTree />		
	</Col>

	const renderBlankSlate = () => <Col sm={{size: 4, offset: 4}}>
		<BlankSlate />
	</Col>

	const hasProviders = providers && providers.length;
	const hasData = hasProviders && _.find(providers, p => {
		return p.selected && p.data && p.data.entry && p.data.entry.length
	});

	return <div>
		<Header />
		<Container fluid>
			<Row className="m-2">
				{ uiState.error && uiState.mode === "ready" && inlineError }
				{ hasProviders ? renderProviderList() : renderBlankSlate() }
				{ hasData ? renderData() : null }
			</Row>
			{ uiState.mode === "editProvider" && <ProviderForm /> }
			{ uiState.mode === "loadData" && <Fetcher /> }
			{ uiState.mode === "githubExport" && <GithubUploader /> }
		</Container>
	</div>
}
export default App;