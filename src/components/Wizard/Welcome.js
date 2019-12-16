import React from "react";
import useStoreon from "storeon/react";
import {Button} from 'reactstrap';


export default() => {

	const {upload, dispatch} = useStoreon("upload");

	return <div>
		<h3>Welcome to Procure</h3>
		<p>This app will walk you through the process of collecting digital copies of your medical records from healthcare institutions where you've received care and transmitting them to {upload.name}. You can find additional information on {upload.name} at <a href={upload.infoUrl} target="_blank" rel="noopener noreferrer">{upload.infoUrl}</a>. You'll also have the option to download a copy to keep for yourself.</p>
		<Button onClick={ e => dispatch("uiState/set", {mode: "editProvider" }) }>Get Started</Button>
	</div>

}