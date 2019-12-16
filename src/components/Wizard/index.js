import React from "react";
import useStoreon from "storeon/react";
import Welcome from "./Welcome";
import SelectProvider from "./SelectProvider";
import Fetcher from "./Fetcher";
import UploadConfirmation from "./UploadConfirmation";
import FileUploader from "./FileUploader";

export default() => {

	//app state
	const {uiState} = useStoreon("uiState");
	
	return <div>
		{/* { uiState.mode === "ready" && <Welcome /> } */}
		{ uiState.mode === "editProvider" && <SelectProvider /> }
		{ uiState.mode === "loadData" && <Fetcher /> }
		{ uiState.mode === "ready" && <UploadConfirmation />}
		{ uiState.mode === "uploadConfirmation" && <UploadConfirmation />}
		{ uiState.mode === "fileUpload" && <FileUploader />}
	</div>

}