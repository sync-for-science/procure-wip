import React from "react";
import useStoreon from "storeon/react";
import Welcome from "./Welcome";
import SelectProvider from "./SelectProvider";
import Fetcher from "./Fetcher";
import UploadConfirmation from "./UploadConfirmation";
import FileUploader from "./FileUploader";

import {Row, Col, Container, Button, Spinner, Dropdown, DropdownMenu, DropdownToggle, DropdownItem} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMedkit, faChevronRight, faChevronLeft, faFileDownload } from "@fortawesome/free-solid-svg-icons"
import Select, { createFilter } from "react-select";


export default() => {


	return <div>
		<Row><Col><h2 style={{color: "#3182CE", padding: "1em 0", textAlign: "center"}}>
			<FontAwesomeIcon icon={faMedkit} alt="Procure logo" className="mr-2" />
			<span>Procure</span>
		</h2></Col></Row>
		<Row><Col md={{size:10, offset: 1}} lg={{size:8, offset: 2}}>
			<div className="shadow p-3 mb-5 bg-white rounded">

				{/* {nav indicator} */}
				<div className="d-none d-sm-block">
					<div className="d-none d-flex flex-row justify-content-around mb-4" style={{borderBottom: "1px solid #3182CE"}}>
						<div className="p-2 text-center">
							<div style={{background: "#3182CE", border: "1px solid white", color: "white", display: "inline-block", minWidth: "2em", minHeight: "2em"}} className="m-1 p-1">1</div>
							<div>Start</div>
						</div>
						<div className="my-auto">
							<FontAwesomeIcon icon={faChevronRight} alt="arrow right" className="m-2" />
						</div>
						<div className="p-2 text-center">
							<div style={{color: "#3182CE", border: "1px solid #3182CE", display:"inline-block", minWidth: "2em", minHeight: "2em"}} className="m-1 p-1">2</div>
							<div>Retrieve Records</div>
						</div>
						<div className="my-auto">
							<FontAwesomeIcon icon={faChevronRight} alt="arrow right" className="m-2" />
						</div>
						<div className="p-2 text-center">
							<div style={{color: "#3182CE", border: "1px solid #3182CE", display:"inline-block", minWidth: "2em", minHeight: "2em"}} className="m-1 p-1">3</div>
							<div>Review</div>
						</div>
						<div className="my-auto">
							<FontAwesomeIcon icon={faChevronRight} alt="arrow right" className="mr-2" />
						</div>
						<div className="p-2 text-center">
							<div style={{color: "#3182CE", border: "1px solid #3182CE", display:"inline-block", minWidth: "2em", minHeight: "2em"}} className="m-1 p-1">4</div>
							<div>Share Records</div>
						</div>
					</div>
				</div>

				{/* {welcome} */}
				<div className="p-2">
					<h4 className="mb-4">Welcome</h4>
					<p>This app will walk you through the process of collecting digital copies of your medical records from healthcare institutions where you've received care and transmitting them to STUDY1. You can find additional information on STUDY1 at <a href="" target="_blank" rel="noopener noreferrer">http://test.com</a>. You'll also have the option to download a copy to keep for yourself.</p>
					<Button color="success" className="float-right mt-4">
						<span className="mr-2">Next</span>
						<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
					</Button>
					<div className="clearfix"></div>
				</div>

				{/* {select provider} */}
				<div className="p-2">
					<h4 className="mb-4">Select Your Provider</h4>
					<p>
						Choose a healthcare institution where you've received care from the list below.
					</p><p>
						If you've been to multiple healthcare providers, after retrieving your records you'll have the option to return to this screen to select another institution.
					</p>
					<div>
						<Select id="organization" />
					</div>
					<Button color="success" className="float-right mt-4">
						<span className="mr-2">Login to Patient Portal</span>
						<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
					</Button>
					<div className="clearfix"></div>
				</div>


				{/* waiting for auth / retrieving records */}
				<div className="p-4 text-center">
					<h5 className="mb-4">Waiting for Portal Login...</h5>
					<div className="my-4">
						<Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
					</div>
					<div>
						<Button color="outline-primary">Cancel</Button>
					</div>
				</div>

				{/* global error */}
				<div className="p-2">
					<h4>Error</h4>
					<p>An error occurred loading your record: Error!!!</p>
					<div>
						<Button color="primary" className="mt-4">
						<FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
							<span className="mr-2">Back</span>
						</Button>
					</div>
				</div>

				{/* review */}
				<div className="p-2">
					<h4 className="mb-4">Review</h4>
					<p>You have collected records from the following healthcare providers:</p>
					{/* only show if data - newest on top */}
					<ul>
						<li>Partners Healthcare (<a href="#">remove</a>)</li>
						<li>A Long Named Institution Healthcare (<a href="#">remove</a>)</li>
						<li><a href="#">Add another provider</a></li>
					</ul>

					<Dropdown  className="float-left mt-4">
						<DropdownToggle color="outline-secondary" caret>
							<FontAwesomeIcon icon={faFileDownload} className="mr-2" />
							<span className="mr-2">Download copy of data</span>
						</DropdownToggle>
						<DropdownMenu>
							<DropdownItem>FHIR Resource Data Models </DropdownItem>
							<DropdownItem>Spreadsheet of Vital Signs</DropdownItem>
							<DropdownItem>Spreadsheet of Quantitative Lab Results</DropdownItem>
						</DropdownMenu>
					</Dropdown>

					<Button color="success" className="float-right mt-4">
						<span className="mr-2">Share with PROJECT</span>
						<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
					</Button>
					<div className="clearfix"></div>
				</div>

				{/* post upload */}
				<div className="p-2">
					<h4>Success</h4>
					<p>Your healthcare records have been successfully shared with PROJECT</p>
					<Button color="success" className="float-right mt-4">
						<span className="mr-2">Continue</span>
						<FontAwesomeIcon icon={faChevronRight} className="mr-2" />
					</Button>
					<Button color="success" className="float-right mt-4">
						<span className="mr-2">Done</span>
					</Button>		
					<Dropdown  className="float-left mt-4">
						<DropdownToggle color="outline-secondary" caret>
							<FontAwesomeIcon icon={faFileDownload} className="mr-2" />
							<span className="mr-2">Download copy of data</span>
						</DropdownToggle>
						<DropdownMenu>
							<DropdownItem>FHIR Resource Data Models </DropdownItem>
							<DropdownItem>Spreadsheet of Vital Signs</DropdownItem>
							<DropdownItem>Spreadsheet of Quantitative Lab Results</DropdownItem>
						</DropdownMenu>
					</Dropdown>			
					<div className="clearfix"></div>
				</div>



		</div>

		</Col></Row> 
	</div>



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