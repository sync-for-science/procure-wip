import React  from "react";
import useStoreon from "storeon/react";
import {Alert, Container, Row, Col} from 'reactstrap';

import ProviderForm from "./ProviderForm";
import ProviderList from "./ProviderList";
import Fetcher from "./Fetcher";
import Loader from "./Loader"
import FhirTree from "./FhirTree";
import Toolbar from "./Toolbar";
import GithubUploader from "./GithubUploader";

const App = () =>  {

	//global state
	const { uiState } = useStoreon("uiState");

	if (uiState.mode === "loading") 
		return <Loader />;

	if (uiState.mode === "globalError")
		return <Container style={{margin: "1em"}}>
			<Alert color="danger">
				<span>Failed to load configuration information.</span><br />
				<span>{uiState.error.toString()}</span>
			</Alert></Container>;
	
	return (
		<Container style={{margin: "1em"}}>
			<Row>
				<Col xs="12">
					<Toolbar />
				</Col>
				<Col xs="12" md="6" lg="5" xl="4">
					<ProviderList />
				</Col>
				<Col xs="12" md="6" lg="7" xl="8">
					<FhirTree />		
				</Col>
			</Row>
		
			{ uiState.mode === "editProvider" && <ProviderForm /> }
			{ uiState.mode === "loadData" && <Fetcher /> }
			{ uiState.mode === "githubExport" && <GithubUploader /> }

		</Container>
	);
	
}
export default App;