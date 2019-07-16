import React from "react";
import useStoreon from "storeon/react";
import {Button} from 'reactstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

export default () => {

	const { dispatch } = useStoreon();

	const handleAddProvider = (e) => {
		e.preventDefault();
		dispatch("uiState/set", {mode: "editProvider"});
	}

	return 	<Button block color="success"
		onClick={handleAddProvider}
	>
		<FontAwesomeIcon icon={faPlus} className="mr-2" />
		Add Provider
	</Button>

}