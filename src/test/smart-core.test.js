global.fetch = require('jest-fetch-mock');
import SMART from "../smart/smart-core";

import metadata from "./data/metadata.json";
import smartConfiguration from "./data/smart-configuration.json";

describe("Finding auth endpoints ", () => {

	const fhirBase = "http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6IjdiNjk3MzIyLTM2MDctNDZjYi1hMjQwLWMwODFiY2NiYTJlNSJ9/fhir/";
	const endpointError = "Authorization endpoint or token endpoint not found";

	const checkEndpoints = (endpoints) => {
		const authorizeEndpoint = "http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6IjdiNjk3MzIyLTM2MDctNDZjYi1hMjQwLWMwODFiY2NiYTJlNSJ9/auth/authorize";
		const tokenEndpoint = "http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6IjdiNjk3MzIyLTM2MDctNDZjYi1hMjQwLWMwODFiY2NiYTJlNSJ9/auth/token";	
		expect(endpoints.authorizationEndpoint).toBe(authorizeEndpoint);
		expect(endpoints.tokenEndpoint).toBe(tokenEndpoint);
	};

	beforeEach( fetch.resetMocks )
	
	test("extract auth endpoints from capability statement", () => {	
		fetch.mockResponse(JSON.stringify(metadata))
		return SMART.getCapabilityEndpoints(fhirBase).then(checkEndpoints);
	})

	test("error if no endpoints in capability statement", () => {
		fetch.mockResponse("{}")
		return expect( SMART.getCapabilityEndpoints(fhirBase) )
			.rejects.toMatch(endpointError);
	})

	test("error if no capability statement", () => {
		fetch.mockResponse("", {status: 404})
		return expect( SMART.getCapabilityEndpoints(fhirBase) )
			.rejects.toMatch(endpointError);
	})

	test("extract auth endpoints from .well-known file", () => {
		fetch.mockResponse(JSON.stringify(smartConfiguration))
		return SMART.getWellKnownEndpoints(fhirBase).then(checkEndpoints);
	})

	test("error if no endpoints in .well-known file", () => {
		fetch.mockResponse("{}")
		return expect( SMART.getWellKnownEndpoints(fhirBase) )
			.rejects.toMatch(endpointError);
	})

	test("use .well-know file if available", () => {
		fetch.mockResponse(JSON.stringify(smartConfiguration))
		return SMART.getAuthEndpoints(fhirBase).then(checkEndpoints);
	})

	test("fall back to capability statement if no .well-known", () => {
		fetch.mockResponses([
			"", {status: 404}
		],[
			JSON.stringify(metadata),			
		])
		return SMART.getAuthEndpoints(fhirBase).then(checkEndpoints);
	})

	test("error if no auth endpoints", () => {
		fetch.mockResponse("", {status: 404})
		return expect( SMART.getAuthEndpoints(fhirBase) )
			.rejects.toMatch(endpointError);
	})
});