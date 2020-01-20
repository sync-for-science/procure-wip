/* eslint jsx-a11y/anchor-is-valid: 0 */ //disable to support bootstrap link styling

import React from "react";
import useStoreon from "storeon/react";
import Start from "./Start";
import SelectProvider from "./SelectProvider";
import Retrieve from "./Retrieve";
import Review from "./Review";
import Upload from "./Upload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMedkit, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import {Row, Col} from "reactstrap";

export default() => {
	
	//app state
	const {uiState, dispatch} = useStoreon("uiState");

	const handleSwitchMode = () => dispatch("wizard/hide");

	const numberStyle = {
		active: {background: "#3182CE", border: "1px solid white", color: "white"},
		inactive: {color: "#3182CE", border: "1px solid #3182CE", background: "white"}
	};

	const switchToFull = uiState.mode !== "loadData" && 
		(uiState.mode !== "upload" || uiState.submode === "loaded") &&
		<Row><Col className="text-center">
			<small className="mt-4 float-right d-none d-sm-block"><a href="#" onClick={handleSwitchMode} className="text-muted">switch to full version of Procure</a></small>
		</Col></Row>;

	return <div>
		{switchToFull}
		<Row><Col>
			<h2 style={{color: "#3182CE", padding: "1em 0", textAlign: "center"}}>
				<FontAwesomeIcon icon={faMedkit} alt="Procure logo" className="mr-2" />
				<span>Procure</span>
			</h2>
		</Col></Row>
		<Row><Col md={{size:10, offset: 1}} lg={{size:8, offset: 2}}>
			<div className="shadow p-4 mb-5 bg-white rounded unbox-sm">

				<div className="d-none d-sm-block">
					<div className="d-none d-flex flex-row justify-content-around mb-4" style={{borderBottom: "1px solid #3182CE"}}>
						<div className="p-2 text-center">
							<div style={{...numberStyle[uiState.mode === "ready" ? "active" : "inactive"], display: "inline-block", minWidth: "2em", minHeight: "2em"}} className="m-1 p-1">1</div>
							<div>Start</div>
						</div>
						<div className="my-auto">
							<FontAwesomeIcon icon={faChevronRight} alt="arrow right" className="m-2" />
						</div>
						<div className="p-2 text-center">
							<div style={{...numberStyle[uiState.mode === "editProvider" || uiState.mode ==="loadData" ? "active" : "inactive"], display:"inline-block", minWidth: "2em", minHeight: "2em"}} className="m-1 p-1">2</div>
							<div>Retrieve Records</div>
						</div>
						<div className="my-auto">
							<FontAwesomeIcon icon={faChevronRight} alt="arrow right" className="m-2" />
						</div>
						<div className="p-2 text-center">
							<div style={{...numberStyle[uiState.mode === "review" ? "active" : "inactive"], display:"inline-block", minWidth: "2em", minHeight: "2em"}} className="m-1 p-1">3</div>
							<div>Review</div>
						</div>
						<div className="my-auto">
							<FontAwesomeIcon icon={faChevronRight} alt="arrow right" className="mr-2" />
						</div>
						<div className="p-2 text-center">
							<div style={{...numberStyle[uiState.mode === "fileUpload" ? "active" : "inactive"], display:"inline-block", minWidth: "2em", minHeight: "2em"}} className="m-1 p-1">4</div>
							<div>Share Records</div>
						</div>
					</div>
				</div>

				{ uiState.mode === "ready" && <Start /> }
				{ uiState.mode === "editProvider" && <SelectProvider /> }
				{ uiState.mode === "loadData" && <Retrieve /> }
				{ uiState.mode === "review" && <Review />}
				{ uiState.mode === "fileUpload" && <Upload />}

			</div>

	</Col></Row> 
	</div>

}