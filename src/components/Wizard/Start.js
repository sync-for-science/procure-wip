import React from "react";
import useStoreon from "storeon/react";
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default() => {

	const {upload, dispatch} = useStoreon("upload");

	return <div className="p-2">
		<h4 className="mb-4">Welcome</h4>
		<p>This app will walk you through the process of collecting digital copies of your medical records from healthcare institutions where you've received care and sharing them with {upload.name}. You can find additional information at <a href={upload.infoUrl} target="_blank" rel="noopener noreferrer">{upload.infoUrl}</a>.
		</p><p>You'll also have the option to download a copy of the data to this device to keep for yourself.</p>
		<Button color="success" className="float-right mt-4"
			onClick={ e => dispatch("uiState/set", {mode: "editProvider" }) }
		>
			<span className="mr-2">Get Started</span>
			<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
		</Button>
		<div className="clearfix"></div>
	</div>


}