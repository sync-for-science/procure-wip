global.fetch = require('jest-fetch-mock');

import fhir from "../smart/fhir";

import patient from "./data/patient.json";
import procedure from "./data/procedure.json";
import observation1 from "./data/observation1.json";
import observation2 from "./data/observation2.json";
import operation_outcome_404 from "./data/operation_outcome_404.json";
import duck from "./data/duck";
import xmlDocument from "./data/document1";

import base64ToBlob from "./util/base64toblob";

const sampleEndpoint = "http://launch.smarthealthit.org/v/r2/fhir"
const samplePatientId = "c7ec9560-58cd-4a08-874b-91e3429ef1d6"
const duckBlob = base64ToBlob(duck, "image/jpeg");

const getFetchUrl = (pos=0) => fetch.mock.calls[pos] ? fetch.mock.calls[pos][0] : undefined;

describe("Extract Path", () => {


	test("one level path", () => {
		const values = fhir.pathToValues(
			"a", {a: "test"}
		)
		expect(values).toEqual(["test"]);
	});

	test("simple nested path", () => {
		const values = fhir.pathToValues(
			"a.b", {a: {b: "test"}}
		)
		expect(values).toEqual(["test"]);
	});

	test("no first level matches", () => {
		const values = fhir.pathToValues(
			"a", {}
		)
		expect(values).toEqual([]);
	});

	test("no nested matches", () => {
		const values = fhir.pathToValues(
			"a.b", {a: {c: "test"}}
		)
		expect(values).toEqual([]);
	});

	test("no matches without depth", () => {
		const values = fhir.pathToValues(
			"a", {a: "test"}
		)
		expect(values).toEqual(["test"]);
	});

	test("array matches", () => {
		const values = fhir.pathToValues("a.b.c", 
			{a: 
				{b:[
					{c: "test"}, {c: "test2"}, {d: "test3"}
				]}
			}
		)
		expect(values).toEqual(["test", "test2"]);
	});

	test("nested array matches", () => {
		const values = fhir.pathToValues("a.b.c.d", 
			{a: [
				{b:[
					{c:[{d: "test"}, {d: "test2"}]}
				]},
				{b:[
					{c:[{d: "test3"}, {d: "test4"}]}
				]}
			]}
		)
		expect(values).toEqual(["test", "test2", "test3", "test4"]);
	});

	test("nested non-matches", () => {
		const values = fhir.pathToValues("a.b.c.d", 
			{a: [
				{b:[
					{c:[{e: "test"}, {e: "test2"}]}
				]},
				{b:[
					{c:[{e: "test3"}, {e: "test4"}]}
				]}
			]}
		)
		expect(values).toEqual([]);
	});

});

describe("Update value at path", () => {
	test("simple path", () => {
		const values = fhir.replaceValue(
			"a.b", 
			{a: {b: "test"}},
			v => v+"2"
		)
		expect(values).toEqual( {a: {b: "test2"}});
	});

	test("array matches", () => {
		const values = fhir.replaceValue(
			"a.b.c", 
			{a: 
				{b:[
					{c: "test"}, {c: "test2"}, {d: "test3"}
				]}
			},
			v =>  v+"a"		
		)
		expect(values.a.b).toEqual(
			[{c: "testa"}, {c: "test2a"}, {d: "test3"}]
		);
	});

})

describe("Get resources by query", () => {

	beforeEach( fetch.resetMocks )

	test("fetch a single resource", () => {	
		fetch.mockResponse(JSON.stringify(patient))

		return fhir.getResourcesByQuery({
			fhirEndpoint: sampleEndpoint, 
			query: {path: "Patient/" + samplePatientId}
		}).then( data => {
			expect(getFetchUrl()).toBe(
				"http://launch.smarthealthit.org/v/r2/fhir/Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"
			);
			expect(data.entry.length).toBe(1);
			expect(data.entry[0].resource.resourceType).toBe("Patient");
		})
	});

	test("search for resources by parameters", () => {	
		fetch.mockResponse(JSON.stringify(procedure))

		return fhir.getResourcesByQuery({
			fhirEndpoint: sampleEndpoint, 
			query: {path: "Procedure?patient=" + samplePatientId}
		}).then( data => {
			expect(getFetchUrl()).toBe(
				"http://launch.smarthealthit.org/v/r2/fhir/Procedure?patient=c7ec9560-58cd-4a08-874b-91e3429ef1d6"
			);
			expect(data.entry.length).toBe(2);
			expect(data.entry[0].resource.resourceType).toBe("Procedure");
		})
	});

	test("error on receiving operation outcome", () => {
		fetch.mockResponse(JSON.stringify(operation_outcome_404));

		return expect( 
			fhir.getResourcesByQuery({
				fhirEndpoint: sampleEndpoint, 
				query: {path: "Patient/" + samplePatientId + "123"}
			})
		).rejects.toMatchObject({
			message: "Resource Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6123 is not known"
		}).then( () => {
			expect(getFetchUrl()).toBe(
				"http://launch.smarthealthit.org/v/r2/fhir/Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6123"
			);	
		})
	});

	test("retry on receiving error when retryLimit is set", () => {
		fetch.mockResponses([
			JSON.stringify(operation_outcome_404)
		],[
			JSON.stringify(patient)
		]);

		return fhir.getResourcesByQuery({
			fhirEndpoint: sampleEndpoint, 
			query: {path: "Patient/" + samplePatientId},
			retryLimit: 2
		}).then( data => {
			expect(data.entry.length).toBe(1);
			expect(data.entry[0].resource.resourceType).toBe("Patient");
		})

	});

	test("follow next links in bundle", () => {
		fetch.mockResponses([
			JSON.stringify(observation1)
		],[
			JSON.stringify(observation2)
		]);

		return fhir.getResourcesByQuery({
			fhirEndpoint: sampleEndpoint, 
			query: { path: "Observation?patient=" + samplePatientId }
		}).then( data => {
			expect(getFetchUrl()).toBe(
				"http://launch.smarthealthit.org/v/r2/fhir/Observation?patient=c7ec9560-58cd-4a08-874b-91e3429ef1d6"
			);
			expect(getFetchUrl(1)).toBe(
				"https://launch.smarthealthit.org/v/r2/fhir?_getpages=b00e8605-46dd-4f3f-8833-e79cfbf2f908&_getpagesoffset=50&_count=50&_pretty=true&_bundletype=searchset"
			);
			expect(data.entry.length).toBe(64);
			expect(data.entry[0].resource.resourceType).toBe("Observation");
		})
	});
	
	test("add provenance to single R4 resource", () => {
		fetch.mockResponse(JSON.stringify(patient))

		return fhir.getResourcesByQuery({
			fhirEndpoint: sampleEndpoint, 
			query: {
				path: "Patient/" + samplePatientId,
				fhirVersion: "R4"
			}
		}).then( data => {
			expect(data.entry[0].resource.meta.source).toBe(sampleEndpoint);
		})
	});

	test("add provenance to single R2 resource", () => {
		fetch.mockResponse(JSON.stringify(patient))

		return fhir.getResourcesByQuery({
			fhirEndpoint: sampleEndpoint,
			query: {
				path: "Patient/" + samplePatientId,
				fhirVersion: "R2"
			}
		}).then( data => {
			expect(data.entry[0].resource.meta.extension[0].valueUri).toBe(sampleEndpoint);
		})
	});

	test("add provenance to resources in a bundle", () => {
		fetch.mockResponse(JSON.stringify(procedure))

		return fhir.getResourcesByQuery({
			fhirEndpoint: sampleEndpoint, 
			query: {
				path: "Observation",
				fhirVersion: "R4"
			}
		}).then( data => {
			expect(data.entry[0].resource.meta.source).toBe(sampleEndpoint);
		})
	});

});

describe("Get referenced resources", () => {

	const practitioner = {
		"resourceType": "Practitioner",
		"id": "1",
		"name": {
			"use": "usual",
			"family": ["Dhillon"],
			"given": ["Puneet", "S"],
			"suffix": ["MD"]
		}
	}

	beforeEach( fetch.resetMocks )

	test("find references in a resource", () => {	

		const references = fhir.findReferences({
			entry: [{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [{"reference": "https://test.org/Practitioner/1"}]
				}
			}],
			paths: "careProvider"
		})
		expect(references["https://test.org/Practitioner/1"][0]).toEqual({
			i: 0, 
			path: "careProvider.reference", 
			rawUrl: "https://test.org/Practitioner/1"
		});
	});

	test("follow references", () => {	
		fetch.mockResponse(JSON.stringify({resourceType: "Organization", id: "1"}));

		return fhir.followReferences({
			entry: [{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [{"reference": "https://test.org/Organization/1"}]
				}
			}], 
			paths: "careProvider"
		}).then( entry => {
			expect(getFetchUrl(0)).toBe("https://test.org/Organization/1");
			expect(entry[0].resource.id).toBe("1");
		})
	});

	test("follow references and embed them in a resource", () => {	
		fetch.mockResponse(JSON.stringify(practitioner))

		return fhir.followAndEmbedReferences({
			entry: [{resource: {  
				"resourceType": "Patient",
				"careProvider": [{"reference": "https://test.org/Practitioner/1"}]
			}}],
			paths: "careProvider"
		}).then( entry => {
			expect(getFetchUrl()).toBe("https://test.org/Practitioner/1");
			expect(entry[0].resource.contained[0].resourceType).toBe("Practitioner");
			expect(entry[0].resource.careProvider[0].reference).toBe("#1");
		})
	});

	test("don't follow contained references", () => {	
		fetch.mockResponse(JSON.stringify(practitioner))

		return fhir.followReferences({
			entry: [{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [{"reference": "#123"}]
				}
			}], 
			path: "careProvider"
		}).then( entry  => {
			expect(getFetchUrl()).toBeUndefined();
		})
	});

	test("follow references at multiple paths", () => {	
		fetch.mockResponses([
			JSON.stringify({resourceType: "Practitioner", id: 1})
		],[
			JSON.stringify({resourceType: "Organization", id: 2})
		])

		return fhir.followAndEmbedReferences({
			entry: [{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [{"reference": "https://test.org/Practitioner/1"}],
					"managingOrganization": {"reference": "https://test.org/Organization/2"}
				}
			}],
			paths: ["managingOrganization", "careProvider"]
		}).then( entry => {
			expect(getFetchUrl(0)).toBe("https://test.org/Organization/2");
			expect(getFetchUrl(1)).toBe("https://test.org/Practitioner/1");
			expect(entry[0].resource.contained.length).toBe(2);
		})
	});

	test("embed references with relative paths", () => {	
		fetch.mockResponse(JSON.stringify(practitioner))

		return fhir.followAndEmbedReferences({
			entry:[{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [{"reference": "Practitioner/1"}]
				}
			}], 
			paths: "careProvider",
			fhirEndpoint: "https://test.org"
		}).then( entry => {
			expect(getFetchUrl()).toBe("https://test.org/Practitioner/1");
			expect(entry[0].resource.contained[0].resourceType).toBe("Practitioner");
			expect(entry[0].resource.careProvider[0].reference).toBe("#1");
		})
	});

	test("only retrieve each resource a single time", () => {	
		fetch.mockResponse(JSON.stringify({resourceType: "Organization", id: 1}));

		return fhir.followAndEmbedReferences({
			entry: [{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [{"reference": "https://test.org/Organization/1"}],
					"managingOrganization": {"reference": "https://test.org/Organization/1"}
				}
			}], 
			paths: ["managingOrganization", "careProvider"]
		}).then( entry => {
			expect(getFetchUrl(0)).toBe("https://test.org/Organization/1");
			expect(getFetchUrl(1)).toBeUndefined();
			expect(entry[0].resource.contained.length).toBe(1);
		})
	});

	test("return an error log if errors are allowed", () => {
		fetch.mockResponses([
			"Not found", {status: 404}
		],[
			JSON.stringify({resourceType: "Organization", id: "2"})
		])

		return fhir.followReferences({
			entry: [{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [{"reference": "https://test.org/Organization/1"}]
				}
			},{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [{"reference": "https://test.org/Organization/2"}]
				}
			}], 
			paths: "careProvider",
			allowErrors: true
		}).then( response => {
			expect(response.errorLog[0].error).toBe("HTTP 404 - Not Found");
			expect(response.errorCount).toBe(1);
			expect(response.entry[0].resource.id).toBe("2");

		})

	});

	test("count errors based on reference quantity rather than resource quantity", () => {	
		fetch.mockResponses([
			"Not found", {status: 404}
		],[
			JSON.stringify({resourceType: "Organization", id: "2"})
		])

		return fhir.followReferences({
			entry: [{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [{"reference": "https://test.org/Organization/1"}]
				}
			},{
				resource: {  
					"resourceType": "Patient",
					"careProvider": [
						{"reference": "https://test.org/Organization/1"},
						{"reference": "https://test.org/Organization/2"}
					]
				}
			}], 
			paths: "careProvider",
			allowErrors: true
		}).then( response => {
			expect(response.errorLog[0].error).toBe("HTTP 404 - Not Found");
			expect(response.errorCount).toBe(2);
			expect(response.entry[0].resource.id).toBe("2");

		})
	});

});

describe("Get referenced attachments", () => {

	beforeEach( fetch.resetMocks )

	test("fetch referenced binary attachment", () => {

		//mock fetch library doesn't handle blobs, so create my own mock here
		const oldFetch = fetch;
		fetch = jest.fn( () => new Promise( 
			(resolve) => resolve({
				ok: true,  blob: () => duckBlob
			})
		));

		return fhir.findAndDownloadAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "image/jpeg", "url": "http://test.org/duck.jpeg"
						}
					}]
				} 
			}], 
			paths: "content.attachment"
		})
		.then( files => {
			expect(files[0].blob.size).toEqual(duckBlob.size)
			fetch = oldFetch;
		})
	});


	test("find referenced attachments", () => {	
		fetch.mockResponse(xmlDocument);

		const attachmentIndex = fhir.findAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					},{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					}]
				}
			}], 
			paths: "content.attachment"
		});
		expect(attachmentIndex['http://test.org/caresummary::application/xml']).toEqual(
			expect.objectContaining({
				contentType: 'application/xml',
				url: 'http://test.org/caresummary',
				count: 2 
			})
		)
	});

	test("fetch referenced attachment in text format", () => {	
		fetch.mockResponse(xmlDocument);

		return fhir.findAndDownloadAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					}]
				}
			}], 
			paths: "content.attachment"
		})
		.then( data => {
			expect(data[0].blob.size).toEqual(
				base64ToBlob(btoa(xmlDocument), "application/xml").size
			)
		})
	});

	test("assign a file name if mime type has a mapping", () => {	
		fetch.mockResponse(xmlDocument);

		return fhir.findAndDownloadAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					}]
				}
			}], 
			paths: "content.attachment",
			mimeTypeMappings: {"application/xml": "xml"}
		})
		.then( data => {
			expect(data[0].fileName).toEqual("1.xml")
		})
	});

	test("assign a file name without a file type if mime type isn't mapped", () => {	
		fetch.mockResponse(xmlDocument);

		return fhir.findAndDownloadAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					}]
				}
			}], 
			paths: "content.attachment",
			mimeTypeMappings: {"application/json": "json"}
		})
		.then( data => {
			expect(data[0].fileName).toEqual("1")
		})
	});

	test("fetch multiple attachments", () => {	
		fetch.mockResponse(xmlDocument);

		return fhir.findAndDownloadAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					},{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary2"
						}
					}]
				} 
			}], 
			paths: "content.attachment"
		})
		.then( data => expect(data.length).toBe(2) )
	});

	test("don't fetch embedded attachments", () => {	
		fetch.mockResponse(xmlDocument);

		return fhir.findAndDownloadAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", 
							"url": "http://test.org/caresummary",
							"data": btoa(xmlDocument)
						}
					}]
				} 
			}], 
			paths: "content.attachment"
		})
		.then( data => expect(data.length).toBe(0) )
	});

	test("return an error log if errors are allowed ", () => {	
		fetch.mockResponses([
			"Not found", {status: 404}
		],[
			JSON.stringify(xmlDocument)
		])

		return fhir.findAndDownloadAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					},{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary2"
						}
					}]
				}
			}], 
			paths: "content.attachment",
			allowErrors: true
		})
		.then( data => {
			expect(data.files.length).toBe(1);
			expect(data.errorLog.length).toBe(1);
		});
	});

	test("retry on receiving error when retryLimit is set", () => {
		fetch.mockResponses([
			"Not found", {status: 404}
		],[
			JSON.stringify(xmlDocument)
		])
		
		return fhir.findAndDownloadAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					}]
				}
			}], 
			paths: "content.attachment",
			allowErrors: true,
			retryLimit: 2
		})
		.then( data => {
			expect(data.files.length).toBe(1);
		});
	});	

	test("log error after retryLimit is hit", () => {
		fetch.mockResponses([
			"Not found", {status: 404}
		],[
			"Not found", {status: 404}
		],[			
			JSON.stringify(xmlDocument)
		])
		
		return fhir.findAndDownloadAttachments({
			entry: [{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					}]
				}
			}], 
			paths: "content.attachment",
			allowErrors: true,
			retryLimit: 1
		})
		.then( data => {
			expect(data.files.length).toBe(0);
			expect(data.errorLog.length).toBe(1);
		});
	});	

	

	test("update DocumentReference resources to reflect attachment filenames", () => {	
		const entry = fhir.attachmentsToFilenames({
			entry:[{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary"
						}
					}]
				}
			},{
				resource: {
					"resourceType": "DocumentReference",
					"content": [{
						"attachment": { 
							"contentType": "application/xml", "url": "http://test.org/caresummary2"
						}
					}]
				}
			}],
			files: [
				{contentType: "application/xml", rawUrl: "http://test.org/caresummary", fileName: "1.xml"},
				{contentType: "application/xml", rawUrl: "http://test.org/caresummary2", fileName: "2.xml"}
			],
			paths: "content.attachment"
		});
		expect(entry[0].resource.content[0].attachment.url).toBe("1.xml");
		expect(entry[1].resource.content[0].attachment.url).toBe("2.xml");
	});

});