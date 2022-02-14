import exporter from "../store/spreadsheet-exporter.js";

import _ from "lodash";

import fs from "fs";
import path from "path";
import stripJsonComments from "strip-json-comments";
import mergeObjects from "../store/merge-objects.js";
const configJson = fs.readFileSync(path.join(__dirname, "../../public/config/config.json"), "utf8");
const config = JSON.parse(stripJsonComments(configJson));
const templates = config.spreadsheetTemplates;

describe("Flatten resources based on template", () => {

	test("flatten a path", () => {
		const resource = { id: "123" };
		const template = [
			{path: "id", name: "ID"}
		];
		const flatData = exporter.flatten(resource, template);
		expect(flatData).toEqual([{
			ID: "123"
		}])
	})

	test("flatten an empty path", () => {
		const resource = { id1: "123" };
		const template = [
			{path: "id", name: "ID"}
		];
		const flatData = exporter.flatten(resource, template);
		expect(flatData).toEqual([{
			ID: undefined
		}])
	})

	test("flatten a path that returns an array", () => {
		const resource = { 
			component: [ { id: "123" }, { id: "456" } ]
		}
		const template = [{
			path: "component",
			children: [
				{ path: "id", name: "ID"}
			]
		}];
		const flatData = exporter.flatten(resource, template);
		expect(flatData).toEqual([
			{ ID: "123" }, {  ID: "456" }
		]);
	})

	test("try alternate paths in sequence", () => {
		const resource = { id2: "123" };
		const template = [
			{path: ["id", "id2"], name: "ID"}
		];
		const flatData = exporter.flatten(resource, template);
		expect(flatData).toEqual([{
			ID: "123"
		}])
	})

	test("create rows for fields with arrays", () => {
		const resource = {
			a:"a",
			b: ["b1", "b2"]
		}
		const template = [
			{path: "a", name:"a"},
			{path: "b", name:"b"}
		]
		const flatData = exporter.flatten(resource, template);
		expect(flatData).toEqual([
			{a:"a", b:"b1"},
			{a:"a", b:"b2"}
		])
	})

	test("create rows for nested array fields", () => {
		const resource = {
			a:"a",
			b: [{
				b1: "b1",
				c: [ {d: "d1"}, {d: "d2"} ]
			},{
				c: [ {d: "d3"}, {d: "d4"} ]
			}]
		};
		const template = [
			{path: "a", name: "a"},
			{path: "b", children: [
				{path: "b1", name: "b1"},
				{path: "c", children: [
					{path: "d", name: "d"}
				]}
			]}
		];
		const flatData = exporter.flatten(resource, template);
		expect(flatData).toEqual([
			{a:"a", b1:"b1", d:"d1"},
			{a:"a", b1:"b1", d:"d2"},
			{a:"a", d:"d3"},
			{a:"a", d:"d4"},
		]);
	});

	test("handle nested paths that skip levels", () => {
		const resource = {
			a:"a",
			b: [{
				c: [ {d: "d1"} ]
			},{
				c: [ {d: "d2"}, {d: "d3"} ]
			}]
		};
		const template = [
			{path: "a", name: "a"},
			{path: "b", children: [
				{path: "c", children: [
					{path: "d", name: "d"}
				]}
			]}
		];
		const flatData = exporter.flatten(resource, template);
		expect(flatData).toEqual([
			{a:"a", d:"d1"},
			{a:"a", d:"d2"},
			{a:"a", d:"d3"}
		]);
	})

	test("fall back to a root path", () => {
		const resource = {
			a: "a",
		}
		const template = [
			{path: "*", children: [
				{path: "a", name:"a"}
			]}
		]
		const flatData = exporter.flatten(resource, template);
		expect(flatData).toEqual([
			{a:"a"}
		])
	})

	test("only return data from valid resources", () => {
		let resource = {a: "a"};
		const template = [{path: "a", name:"a", test: "isA"}];
		const helperFns = {isA: v => v === "a" };
		let flatData = exporter.flatten(resource, template, {}, helperFns);
		expect(flatData).toEqual([{a:"a"}]);
		resource.a = "b"
		flatData = exporter.flatten(resource, template, {}, helperFns);
		expect(flatData).toEqual(null);
	})

	test("pass helper data to functions", () => {
		let resource = {a: "a"};
		const template = [{path: "a", name:"a", test: "isA"}];
		const helperFns = {
			isA: (v, template, helperData) => {
				return v === helperData ;
			}
		}
		let flatData = exporter.flatten(resource, template, "a", helperFns);
		expect(flatData).toEqual([{a:"a"}]);
	})

	test("pass template data to functions", () => {
		let resource = {a: "a"};
		const template = [{path: "a", name:"a", test: "isA", target:"a"}];
		const helperFns = {isA: (v, template) => (v === template.target) };
		let flatData = exporter.flatten(resource, template, {}, helperFns);
		expect(flatData).toEqual([{a:"a"}]);
	})

	test("don't return data if resource has nested paths with invalid values", () => {
		const resource = {
			a:"a",
			b: [{
				c: [ {d: "d1"} ]
			},{
				c: [ {d: "d2"}, {d: "d3"} ]
			}]
		};
		const template = [
			{path: "a", name: "a"},
			{path: "b", children: [
				{path: "c", children: [
					{path: "d", name: "d", test: "notD4"}
				]}
			]}
		];
		const helperFns = { notD4: v => v !== "d3" };
		const flatData = exporter.flatten(resource, template, {}, helperFns);
		expect(flatData).toEqual(null);
	})

	test("transform data using helper function", () => {
		const resource = {
			a: [{
				b: [ {c: "c2"}, {c: "c3"} ]
			}]
		};
		const template = [
			{path: "a", children: [
				{path: "b", transform: "mergeCs", name: "b"}
			]}
		];
		const helperFns = { mergeCs: v => {
			return _.chain(v).map( v => v.c ).join(" ").value() 
		} }
		const flatData = exporter.flatten(resource, template, {}, helperFns);
		expect(flatData).toEqual([{b: "c2 c3"}]);
	})

	test("return an empty array if template lacks field names", () => {
		const resource = {a:"a"};
		const template = [{path: "a"}];
		const flatData = exporter.flatten(resource, template);
		expect(flatData).toEqual([]);
	})

});

describe("Flatten Observations", () => {

	test("flatten a r2 vital sign", () => {
		const resource =  {
			"effectiveDateTime": "2015-08-26T22:00:00Z",
			"resourceType": "Observation",
			"category": {
				"text": "Vital Signs",
				"coding": [{
					"system": "http://hl7.org/fhir/observation-category",
					"code": "vital-signs",
					"display": "Vital Signs"
				}]
			},
			"status": "final",
			"id": "1",
			"code": {
			  "text": "BMI (Calculated)",
			  "coding": [{
				  "system": "http://loinc.org",
				  "code": "39156-5",
				  "display": "Body mass index"
				},{
				  "system": "http://loinc.org",
				  "code": "8716-3",
				  "display": "Vital Signs grouping"
				}]
			},
			"valueQuantity": {
			  "value": 22.5
			}
		};
		const flatResource = exporter.flatten(
			resource, templates.vitalSigns.template, {source: "test"}
		);
		expect(flatResource).toEqual([{
			ResourceId: '1',
			Source: 'test',
			EffectiveDateTime: new Date('2015-08-26T22:00:00Z'),
			Status: 'final',
			ObservationType: 'BMI (Calculated)',
			ObservationCodes: 'http://loinc.org|39156-5 http://loinc.org|8716-3',
			ValueType: 'BMI (Calculated)',
			ValueCodes: 'http://loinc.org|39156-5 http://loinc.org|8716-3',
			Value: 22.5,
			ValueUnit: undefined
		}])
	});
	
	test("flatten a r4 vital sign", () => {
		const resource =  {
			"resourceType": "Observation",
			"id": "1",
			"status": "final",
			"category": [{
				"coding": [{
					"system": "http://terminology.hl7.org/CodeSystem/observation-category",
					"code": "vital-signs",
					"display": "Vital Signs"
				}],
				"text": "Vital Signs"
			}],
			"code": {
				"coding": [{
					"system": "http://loinc.org",
					"code": "39156-5",
					"display": "Body Mass Index (BMI) [Ratio]"
				},{
					"system": "http://loinc.org",
					"code": "8716-3",
					"display": "Vital signs"
				}],
				"text": "BMI (Calculated)"
			},
			"subject": {
				"reference": "Patient/euBTtyZGh3f-JTiA7uZ5FgZJna7wj9UegXGnkSaLxxLk3",
			},
			"encounter": {
				"reference": "Encounter/eVMXHnnT7souX6XGVBlM3Cg3"
			},
			"effectiveDateTime": "2018-08-09T14:50:00Z",
			"valueQuantity": {"value": 24.3}
		};
		const flatResource = exporter.flatten(
			resource, templates.vitalSigns.template, {source: "test"}
		);
		expect(flatResource).toEqual([{
			ResourceId: '1',
			Source: 'test',
			EffectiveDateTime: new Date('2018-08-09T14:50:00Z'),
			Status: 'final',
			ObservationType: 'BMI (Calculated)',
			ObservationCodes: 'http://loinc.org|39156-5 http://loinc.org|8716-3',
			ValueType: 'BMI (Calculated)',
			ValueCodes: 'http://loinc.org|39156-5 http://loinc.org|8716-3',
			Value: 24.3,
			ValueUnit: undefined
		}])
	});

	test("flatten a r2 blood pressure", () => {
		const resource =  {
			"resourceType": "Observation",
			"effectiveDateTime": "2015-08-26T22:00:00Z",
			"status": "final",
			"category": {
				"text": "Vital Signs",
				"coding": [{
					"system": "http://hl7.org/fhir/observation-category",
					"code": "vital-signs",
					"display": "Vital Signs"
				}]
			},
			"id": "1",
			"code": {
				"text": "BP",
				"coding": [{
					"system": "http://loinc.org",
					"code": "55284-4",
					"display": "Blood pressure systolic and diastolic"
				}]
			},
			"component": [{
				"code": {
					"text": "Systolic blood pressure",
					"coding": [{
						"system": "http://loinc.org",
						"code": "8480-6",
						"display": "Systolic blood pressure"
					}]
				},
				"valueQuantity": {
					"value": 120,
					"unit": "mm[Hg]",
					"code": "mm[Hg]",
					"system": "http://unitsofmeasure.org"
				}
			},{
				"code": {
					"text": "Diastolic blood pressure",
					"coding": [{
						"system": "http://loinc.org",
						"code": "8462-4",
						"display": "Diastolic blood pressure"
					}]
				},
				"valueQuantity": {
					"value": 72,
					"unit": "mm[Hg]",
					"code": "mm[Hg]",
					"system": "http://unitsofmeasure.org"
				}
			}]
		};
		const flatResource = exporter.flatten(
			resource, templates.vitalSigns.template, {source: "test"}
		);
		expect(flatResource).toEqual([{ 
			ResourceId: '1',
			Source: 'test',
			EffectiveDateTime: new Date('2015-08-26T22:00:00Z'),
			Status: 'final',
			ObservationType: 'BP',
			ObservationCodes: 'http://loinc.org|55284-4',
			ValueType: 'Systolic blood pressure',
			ValueCodes: 'http://loinc.org|8480-6',
			Value: 120,
			ValueUnit: 'mm[Hg]'
		},{ 
			ResourceId: '1',
			Source: 'test',
			EffectiveDateTime: new Date('2015-08-26T22:00:00Z'),
			Status: 'final',
			ObservationType: 'BP',
			ObservationCodes: 'http://loinc.org|55284-4',
			ValueType: 'Diastolic blood pressure',
			ValueCodes: 'http://loinc.org|8462-4',
			Value: 72,
			ValueUnit: 'mm[Hg]'
		}]);
	});

	test("flatten a r4 blood pressure", () => {
		const resource =  {
			"resourceType": "Observation",
			"effectiveDateTime": "2015-08-26T22:00:00Z",
			"status": "final",
			"category": [{
				"text": "Vital Signs",
				"coding": [{
					"system": "http://hl7.org/fhir/observation-category",
					"code": "vital-signs",
					"display": "Vital Signs"
				}]
			}],
			"id": "1",
			"code": {
				"text": "BP",
				"coding": [{
					"system": "http://loinc.org",
					"code": "55284-4",
					"display": "Blood pressure systolic and diastolic"
				}]
			},
			"component": [{
				"code": {
					"text": "Systolic blood pressure",
					"coding": [{
						"system": "http://loinc.org",
						"code": "8480-6",
						"display": "Systolic blood pressure"
					}]
				},
				"valueQuantity": {
					"value": 120,
					"unit": "mm[Hg]",
					"code": "mm[Hg]",
					"system": "http://unitsofmeasure.org"
				}
			},{
				"code": {
					"text": "Diastolic blood pressure",
					"coding": [{
						"system": "http://loinc.org",
						"code": "8462-4",
						"display": "Diastolic blood pressure"
					}]
				},
				"valueQuantity": {
					"value": 72,
					"unit": "mm[Hg]",
					"code": "mm[Hg]",
					"system": "http://unitsofmeasure.org"
				}
			}]
		};
		const flatResource = exporter.flatten(
			resource, templates.vitalSigns.template, {source: "test"}
		);
		expect(flatResource).toEqual([{ 
			ResourceId: '1',
			Source: 'test',
			EffectiveDateTime: new Date('2015-08-26T22:00:00Z'),
			Status: 'final',
			ObservationType: 'BP',
			ObservationCodes: 'http://loinc.org|55284-4',
			ValueType: 'Systolic blood pressure',
			ValueCodes: 'http://loinc.org|8480-6',
			Value: 120,
			ValueUnit: 'mm[Hg]'
		},{ 
			ResourceId: '1',
			Source: 'test',
			EffectiveDateTime: new Date('2015-08-26T22:00:00Z'),
			Status: 'final',
			ObservationType: 'BP',
			ObservationCodes: 'http://loinc.org|55284-4',
			ValueType: 'Diastolic blood pressure',
			ValueCodes: 'http://loinc.org|8462-4',
			Value: 72,
			ValueUnit: 'mm[Hg]'
		}]);
	});

	test("flatten a r2 lab result", () => {
		const resource =  {
			"effectiveDateTime": "2015-08-26T22:00:00Z",
			"resourceType": "Observation",
			"category": {
				"text": "Laboratory",
				"coding": [{
					"system": "http://hl7.org/fhir/observation-category",
					"code": "laboratory",
					"display": "Laboratory"
				}]
			},
			"status": "final",
			"id": "1",
			"code": {
				"text": "HEMOGLOBIN A1C/HEMOGLOBIN TOTAL IN BLOOD",
				"coding": [{
					"system": "http://loinc.org",
					"code": "4548-4",
					"display": "Hemoglobin A1c/Hemoglobin.total in Blood"
				}]
			},
			"valueQuantity": {
				"value": 3,
				"unit": "%",
				"code": "%",
				"system": "http://unitsofmeasure.org"
			},
			"interpretation": {
				"text": "Abnormal",
				"coding": [{
					"system": "http://hl7.org/fhir/ValueSet/observation-interpretation",
					"code": "A",
					"display": "Abnormal"
				}]
			},
			"referenceRange": [{
				"text": "4.0 - 6.0 %",
				"low": {
					"value": 4,
					"unit": "%",
					"code": "%",
					"system": "http://unitsofmeasure.org"
				},
				"high": {
					"value": 6,
					"unit": "%",
					"code": "%",
					"system": "http://unitsofmeasure.org"
				}
			}]
		};
		const template = mergeObjects.merge([
			templates.vitalSigns.template, templates.laboratory.template
		])
		const flatResource = exporter.flatten(
			resource, template, {source: "test"}
		);
		expect(flatResource).toEqual([{
			ResourceId: '1',
			Source: 'test',
			EffectiveDateTime: new Date('2015-08-26T22:00:00Z'),
			Status: 'final',
			ObservationType: 'HEMOGLOBIN A1C/HEMOGLOBIN TOTAL IN BLOOD',
			ObservationCodes: 'http://loinc.org|4548-4',
			ValueType: 'HEMOGLOBIN A1C/HEMOGLOBIN TOTAL IN BLOOD',
			ValueCodes: 'http://loinc.org|4548-4',
			Value: 3,
			ValueUnit: '%',
			ReferenceLowValue: 4,
			ReferenceLowUnit: '%',
			ReferenceHighValue: 6,
			ReferenceHighUnit: '%',
			Interpretation: 'Abnormal',
			InterpretationCode: 'http://hl7.org/fhir/ValueSet/observation-interpretation|A'
		}])
	});

	test("flatten a r4 lab result", () => {
		const resource =  {
			"effectiveDateTime": "2015-08-26T22:00:00Z",
			"resourceType": "Observation",
			"category": [{
				"text": "Laboratory",
				"coding": [{
					"system": "http://hl7.org/fhir/observation-category",
					"code": "laboratory",
					"display": "Laboratory"
				}]
			}],
			"status": "final",
			"id": "1",
			"code": {
				"text": "HEMOGLOBIN A1C/HEMOGLOBIN TOTAL IN BLOOD",
				"coding": [{
					"system": "http://loinc.org",
					"code": "4548-4",
					"display": "Hemoglobin A1c/Hemoglobin.total in Blood"
				}]
			},
			"valueQuantity": {
				"value": 3,
				"unit": "%",
				"code": "%",
				"system": "http://unitsofmeasure.org"
			},
			"interpretation": {
				"text": "Abnormal",
				"coding": [{
					"system": "http://hl7.org/fhir/ValueSet/observation-interpretation",
					"code": "A",
					"display": "Abnormal"
				}]
			},
			"referenceRange": [{
				"text": "4.0 - 6.0 %",
				"low": {
					"value": 4,
					"unit": "%",
					"code": "%",
					"system": "http://unitsofmeasure.org"
				},
				"high": {
					"value": 6,
					"unit": "%",
					"code": "%",
					"system": "http://unitsofmeasure.org"
				}
			}]
		};
		const template = mergeObjects.merge([
			templates.vitalSigns.template, templates.laboratory.template
		])
		const flatResource = exporter.flatten(
			resource, template, {source: "test"}
		);
		expect(flatResource).toEqual([{
			ResourceId: '1',
			Source: 'test',
			EffectiveDateTime: new Date('2015-08-26T22:00:00Z'),
			Status: 'final',
			ObservationType: 'HEMOGLOBIN A1C/HEMOGLOBIN TOTAL IN BLOOD',
			ObservationCodes: 'http://loinc.org|4548-4',
			ValueType: 'HEMOGLOBIN A1C/HEMOGLOBIN TOTAL IN BLOOD',
			ValueCodes: 'http://loinc.org|4548-4',
			Value: 3,
			ValueUnit: '%',
			ReferenceLowValue: 4,
			ReferenceLowUnit: '%',
			ReferenceHighValue: 6,
			ReferenceHighUnit: '%',
			Interpretation: 'Abnormal',
			InterpretationCode: 'http://hl7.org/fhir/ValueSet/observation-interpretation|A'
		}])
	});


	test("set type to code text or fallback to first display value", () => {
		let resource =  {
			"code": {
				"text": "HEMOGLOBIN A1C/HEMOGLOBIN TOTAL IN BLOOD",
				"coding": [{
					"system": "http://loinc.org",
					"code": "4548-4",
					"display": "Hemoglobin A1c/Hemoglobin.total in Blood"
				}]
			}
		};
		const template = [
			{"name": "ObservationType", "path": ["code.text", "code.coding[0].display"]}
		]
		expect( 
			exporter.flatten(resource, template)[0].ObservationType
		).toEqual(
			"HEMOGLOBIN A1C/HEMOGLOBIN TOTAL IN BLOOD"
		);
		resource.code.text = undefined;
		expect( 
			exporter.flatten(resource, template)[0].ObservationType
		).toEqual(
			"Hemoglobin A1c/Hemoglobin.total in Blood"
		);
	});

	test("consolidate multiple codableConcepts into searchable string", () => {
		const resource =  {
			"code": {
				"text": "BMI (Calculated)",
				"coding": [{
					"system": "http://loinc.org",
					"code": "39156-5",
					"display": "Body mass index"
				  },{
					"system": "http://loinc.org",
					"code": "8716-3",
					"display": "Vital Signs grouping"
				  }]
			  }
		};
		const template = [
			{"name": "ObservationCodes", "path": "code.coding", "transform": "stringifyCodings"}
		]
		expect( 
			exporter.flatten(resource, template)[0].ObservationCodes
		).toEqual(
			"http://loinc.org|39156-5 http://loinc.org|8716-3"
		)
	});

	test("limit to r2 observations with a code, valid category and quantity value", () => {
		let resources = [{
			//valid
			resource: {
				"resourceType": "Observation",
				"category": {
					"text": "Vital Signs",
					"coding": [{
						"system": "http://hl7.org/fhir/observation-category",
						"code": "vital-signs",
						"display": "Vital Signs"
					}]
				},
				"code": {
				  "text": "BMI (Calculated)",
				  "coding": [{
					  "system": "http://loinc.org",
					  "code": "39156-5",
					  "display": "Body mass index"
					}]
				},
				"valueQuantity": { "value": 22.5 }
			}
		},{
			//not an observation
			resource: {
				"resourceType": "Condition",
				"category": {
					"coding": [{
						"system": "http://hl7.org/fhir/observation-category",
						"code": "vital-signs",
						"display": "Vital Signs"
					}]
				},
				"code": {
				  "text": "BMI (Calculated)",
				  "coding": [{
					  "system": "http://loinc.org",
					  "code": "39156-5",
					  "display": "Body mass index"
					}]
				},
				"valueQuantity": { "value": 22.5 }
			}
		},{
			//not a vital sign
			resource: {
				"resourceType": "Observation",
				"category": {
					"coding": [{
						"system": "http://hl7.org/fhir/observation-category",
						"code": "laboratory",
					}]
				},
				"code": {
					"text": "BMI (Calculated)",
					"coding": [{
						"system": "http://loinc.org",
						"code": "39156-5",
						"display": "Body mass index"
					}]
				},
				"valueQuantity": { "value": 22.5 }
			}
		},{
			//no valueQuantity
			resource: {
				"resourceType": "Observation",
				"category": {
					"text": "Vital Signs",
					"coding": [{
						"system": "http://hl7.org/fhir/observation-category",
						"code": "vital-signs",
						"display": "Vital Signs"
					}]
				},
				"code": {
					"text": "BMI (Calculated)",
					"coding": [{
						"system": "http://loinc.org",
						"code": "39156-5",
						"display": "Body mass index"
					}]
				}
			}
		}];
		let providers = [{selected: true, data: {entry: resources}}];
		expect( 
			exporter.flattenProviders(providers, templates.vitalSigns.template).length
		).toEqual(1);
	});

	test("limit to r4 observations with a code, valid category and quantity value", () => {
		let resources = [{
			//valid
			resource: {
				"resourceType": "Observation",
				"category": [{
					"text": "Vital Signs",
					"coding": [{
						"system": "http://hl7.org/fhir/observation-category",
						"code": "vital-signs",
						"display": "Vital Signs"
					}]
				}],
				"code": {
				  "text": "BMI (Calculated)",
				  "coding": [{
					  "system": "http://loinc.org",
					  "code": "39156-5",
					  "display": "Body mass index"
					}]
				},
				"valueQuantity": { "value": 22.5 }
			}
		},{
			//not an observation
			resource: {
				"resourceType": "Condition",
				"category": [{
					"coding": [{
						"system": "http://hl7.org/fhir/observation-category",
						"code": "vital-signs",
						"display": "Vital Signs"
					}]
				}],
				"code": {
				  "text": "BMI (Calculated)",
				  "coding": [{
					  "system": "http://loinc.org",
					  "code": "39156-5",
					  "display": "Body mass index"
					}]
				},
				"valueQuantity": { "value": 22.5 }
			}
		},{
			//not a vital sign
			resource: {
				"resourceType": "Observation",
				"category": [{
					"coding": [{
						"system": "http://hl7.org/fhir/observation-category",
						"code": "laboratory",
					}]
				}],
				"code": {
					"text": "BMI (Calculated)",
					"coding": [{
						"system": "http://loinc.org",
						"code": "39156-5",
						"display": "Body mass index"
					}]
				},
				"valueQuantity": { "value": 22.5 }
			}
		},{
			//no valueQuantity
			resource: {
				"resourceType": "Observation",
				"category": [{
					"text": "Vital Signs",
					"coding": [{
						"system": "http://hl7.org/fhir/observation-category",
						"code": "vital-signs",
						"display": "Vital Signs"
					}]
				}],
				"code": {
					"text": "BMI (Calculated)",
					"coding": [{
						"system": "http://loinc.org",
						"code": "39156-5",
						"display": "Body mass index"
					}]
				}
			}
		}];
		let providers = [{selected: true, data: {entry: resources}}];
		expect( 
			exporter.flattenProviders(providers, templates.vitalSigns.template).length
		).toEqual(1);
	});

});