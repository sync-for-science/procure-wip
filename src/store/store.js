import createStore from "storeon";
import FhirLoader from "./fhir-loader";
import ConfigLoader from "./config-loader";
import ZipExporter from "./zip-exporter";
import GithubExporter from "./github-exporter";

const initialState = {
	//modalUi
	uiState: {mode: "loading"},
	nonModalUi: {},
	mimeTypeMappings: {},
	githubConfig: {
		token: "19bac35872878509e973cbf017249af977176434",
		owner: "s4stest",
		project: "healthrecord3"
	},
	providers: [{
	// 	fhirEndpoint: "https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/",
	// 	id: "0.dyhtvh2kv8a",
	// 	org: "cerner-open-jake",
	// 	isOpen: true,
	// 	name: "Sandbox - Open - Cerner",
	// 	patient: "1316020",
	// 	queryProfile: "documents",
	// 	redirectUri: "http://localhost:3000/callback.html",
	// 	scope: ["patient/*.read", "launch/patient", "patient/RelatedPerson.read"]
	// },{
		// id: 4,
		// name: "Sandbox - Secure - Epic",
		// clientId: "8ab5bc00-5c7b-4dc4-bf2f-3eba54e3b21d",
		// fhirEndpoint:"https://open-ic.epic.com/argonaut/api/FHIR/Argonaut/",
		// scope: ['launch/patient','patient/*.read'],
		// redirectUri: "http://localhost:3000/callback.html",
		// queryProfile: "argonaut_r2"		
	
	// 	"fhirEndpoint": "https://open-ic.epic.com/FHIR/api/FHIR/DSTU2/",
	// 	"id": "0.3tholtyj071",
	// 	"isOpen": true,
	// 	"name": "Sandbox - Open - Epic (Emily Williams)",
	// 	"orgId": "epic-open-emily",
	// 	"patient": "TwncfOQytqCYtmJKvdpDOSU7U1upj6s9crg-PFHQgSO0B",
	// 	"queryProfile": "documents",
	// 	"redirectUri": "http://localhost:3000/callback.html",
	// 	"scope": ["patient/*.read", "launch/patient"]
	// },{
		// name: "SMART Sandbox - Open",
		// id: 1,
		// fhirEndpoint: "http://r2.smarthealthit.org",
		// isOpen: true,
		// queryProfile: "argonaut_spec",
		// patient: "c7ec9560-58cd-4a08-874b-91e3429ef1d6",
		// org: "smart_open_c7ec9560-58cd-4a08-874b-91e3429ef1d6",
	// },{



		// name: "EPIC Open Sandbox Documents",
		// id: 3,
		// fhirEndpoint: "https://open-ic.epic.com/FHIR/api/FHIR/DSTU2/",
		// patient: "Tbt3KuCY0B5PSrJvCu2j-PlK.aiHsu2xUjUM8bWpetXoB",
		// isOpen: "true",
		// queryProfile: "argonaut_epic",
		// resourceCount: 24,
		// lastUpdated: new Date(),

		// name: "EPIC Open Sandbox Documents",
		// fhirEndpoint: "https://open-ic.epic.com/FHIR/api/FHIR/DSTU2/",
		// id: "0.f8jkqbklhuo",
		// isOpen: "true",
		// orgId: "epic-open-emily",
		// patient: "TwncfOQytqCYtmJKvdpDOSU7U1upj6s9crg-PFHQgSO0B",
		// queryProfile: "documents",
		// redirectUri: "http://localhost:3000/callback.html",
		// scope: ["patient/*.read", "launch/patient"]
	// },{
		name: "SMART Sandbox - Secure",
		id: 2,
		fhirEndpoint: "http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir",
		scope: ["patient/*.read", "launch/patient"],
		clientId: "fake_client_id",
		redirectUri: "http://localhost:3000/callback.html",
		isOpen: false,
		orgId: "http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir",
		queryProfile: "labs",
		lastUpdated: new Date(),
		data: {"entry":[{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/a3beb832-9946-4a39-86ee-dc933a53cebf","resource":{"resourceType":"Observation","id":"a3beb832-9946-4a39-86ee-dc933a53cebf","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:13:26.507-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"39156-5","display":"Body Mass Index"}],"text":"Body Mass Index"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/eb306de2-f4a2-47ee-ad3e-b22f6bc2bd3e"},"effectiveDateTime":"2015-11-07T04:41:40-05:00","issued":"2015-11-07T04:41:40-05:00","valueQuantity":{"value":46.876914477119115,"unit":"kg/m2","system":"http://unitsofmeasure.org/","code":"kg/m2"}},"search":{"mode":"match"}} ]}
		// data: {"entry":[{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/a3beb832-9946-4a39-86ee-dc933a53cebf","resource":{"resourceType":"Observation","id":"a3beb832-9946-4a39-86ee-dc933a53cebf","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:13:26.507-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"39156-5","display":"Body Mass Index"}],"text":"Body Mass Index"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/eb306de2-f4a2-47ee-ad3e-b22f6bc2bd3e"},"effectiveDateTime":"2015-11-07T04:41:40-05:00","issued":"2015-11-07T04:41:40-05:00","valueQuantity":{"value":46.876914477119115,"unit":"kg/m2","system":"http://unitsofmeasure.org/","code":"kg/m2"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/100427a3-d038-4737-9dfd-3913b9af28fd","resource":{"resourceType":"Observation","id":"100427a3-d038-4737-9dfd-3913b9af28fd","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:13:32.231-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"29463-7","display":"Body Weight"}],"text":"Body Weight"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/70677dff-e863-4728-a537-9bb853beae72"},"effectiveDateTime":"2009-06-13T12:15:38-04:00","issued":"2009-06-13T12:15:38-04:00","valueQuantity":{"value":97.87361132723062,"unit":"kg","system":"http://unitsofmeasure.org/","code":"kg"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/ae3a00bd-83cc-4566-bf7d-5bc621e64edc","resource":{"resourceType":"Observation","id":"ae3a00bd-83cc-4566-bf7d-5bc621e64edc","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:14:52.985-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"55284-4","display":"Blood Pressure"}]},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/eb306de2-f4a2-47ee-ad3e-b22f6bc2bd3e"},"effectiveDateTime":"2015-11-07T04:41:40-05:00","issued":"2015-11-07T04:41:40-05:00","component":[{"code":{"coding":[{"system":"http://loinc.org","code":"8480-6","display":"Systolic Blood Pressure"}],"text":"Systolic Blood Pressure"},"valueQuantity":{"value":109,"unit":"mmHg","system":"http://unitsofmeasure.org/","code":"mmHg"}},{"code":{"coding":[{"system":"http://loinc.org","code":"8462-4","display":"Diastolic Blood Pressure"}],"text":"Diastolic Blood Pressure"},"valueQuantity":{"value":70,"unit":"mmHg","system":"http://unitsofmeasure.org/","code":"mmHg"}}]},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/a0c3d4db-788b-4d14-a8b3-7bd021c720a9","resource":{"resourceType":"Observation","id":"a0c3d4db-788b-4d14-a8b3-7bd021c720a9","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:19:58.730-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"8302-2","display":"Body Height"}],"text":"Body Height"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/c5c4d1a9-5f7a-40e0-8dd8-1bbd38f1e02b"},"effectiveDateTime":"2011-06-21T01:49:44-04:00","issued":"2011-06-21T01:49:44-04:00","valueQuantity":{"value":151.10876084786392,"unit":"cm","system":"http://unitsofmeasure.org/","code":"cm"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/2c8fe15e-da43-4714-a71f-bcba9f86675e","resource":{"resourceType":"Observation","id":"2c8fe15e-da43-4714-a71f-bcba9f86675e","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:22:47.855-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"55284-4","display":"Blood Pressure"}]},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/c5c4d1a9-5f7a-40e0-8dd8-1bbd38f1e02b"},"effectiveDateTime":"2011-06-21T01:49:44-04:00","issued":"2011-06-21T01:49:44-04:00","component":[{"code":{"coding":[{"system":"http://loinc.org","code":"8480-6","display":"Systolic Blood Pressure"}],"text":"Systolic Blood Pressure"},"valueQuantity":{"value":101,"unit":"mmHg","system":"http://unitsofmeasure.org/","code":"mmHg"}},{"code":{"coding":[{"system":"http://loinc.org","code":"8462-4","display":"Diastolic Blood Pressure"}],"text":"Diastolic Blood Pressure"},"valueQuantity":{"value":84,"unit":"mmHg","system":"http://unitsofmeasure.org/","code":"mmHg"}}]},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/8c1ab84b-bf63-4a51-a24a-95b7115d779e","resource":{"resourceType":"Observation","id":"8c1ab84b-bf63-4a51-a24a-95b7115d779e","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:25:04.622-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"8302-2","display":"Body Height"}],"text":"Body Height"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/70677dff-e863-4728-a537-9bb853beae72"},"effectiveDateTime":"2009-06-13T12:15:38-04:00","issued":"2009-06-13T12:15:38-04:00","valueQuantity":{"value":151.10876084786392,"unit":"cm","system":"http://unitsofmeasure.org/","code":"cm"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/52734693-8245-4fa4-a4d0-08bbd577f0c5","resource":{"resourceType":"Observation","id":"52734693-8245-4fa4-a4d0-08bbd577f0c5","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:25:49.583-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"39156-5","display":"Body Mass Index"}],"text":"Body Mass Index"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/70677dff-e863-4728-a537-9bb853beae72"},"effectiveDateTime":"2009-06-13T12:15:38-04:00","issued":"2009-06-13T12:15:38-04:00","valueQuantity":{"value":42.86337114842033,"unit":"kg/m2","system":"http://unitsofmeasure.org/","code":"kg/m2"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/98e32945-97b3-455a-8135-d6a154af5c24","resource":{"resourceType":"Observation","id":"98e32945-97b3-455a-8135-d6a154af5c24","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:27:19.747-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"29463-7","display":"Body Weight"}],"text":"Body Weight"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/eb306de2-f4a2-47ee-ad3e-b22f6bc2bd3e"},"effectiveDateTime":"2015-11-07T04:41:40-05:00","issued":"2015-11-07T04:41:40-05:00","valueQuantity":{"value":107.03807901312193,"unit":"kg","system":"http://unitsofmeasure.org/","code":"kg"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/4b8a0b20-4aca-4cc3-96a8-75b8a0195a86","resource":{"resourceType":"Observation","id":"4b8a0b20-4aca-4cc3-96a8-75b8a0195a86","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:28:52.763-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"8302-2","display":"Body Height"}],"text":"Body Height"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/eb306de2-f4a2-47ee-ad3e-b22f6bc2bd3e"},"effectiveDateTime":"2015-11-07T04:41:40-05:00","issued":"2015-11-07T04:41:40-05:00","valueQuantity":{"value":151.10876084786392,"unit":"cm","system":"http://unitsofmeasure.org/","code":"cm"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/ed1a6409-4f86-4c9a-aa41-73a06f57faaa","resource":{"resourceType":"Observation","id":"ed1a6409-4f86-4c9a-aa41-73a06f57faaa","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:29:20.340-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"29463-7","display":"Body Weight"}],"text":"Body Weight"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/d4257739-1e7e-4164-8555-23a4938c9413"},"effectiveDateTime":"2013-11-07T10:50:38-05:00","issued":"2013-11-07T10:50:38-05:00","valueQuantity":{"value":104.18180210043145,"unit":"kg","system":"http://unitsofmeasure.org/","code":"kg"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/2d6f7064-2395-42cc-8b30-9d01b05de8d9","resource":{"resourceType":"Observation","id":"2d6f7064-2395-42cc-8b30-9d01b05de8d9","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:31:17.485-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"39156-5","display":"Body Mass Index"}],"text":"Body Mass Index"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/d4257739-1e7e-4164-8555-23a4938c9413"},"effectiveDateTime":"2013-11-07T10:50:38-05:00","issued":"2013-11-07T10:50:38-05:00","valueQuantity":{"value":45.6260190033434,"unit":"kg/m2","system":"http://unitsofmeasure.org/","code":"kg/m2"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/496756b1-54a3-4b6d-b950-a3b8ec919903","resource":{"resourceType":"Observation","id":"496756b1-54a3-4b6d-b950-a3b8ec919903","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:31:40.230-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"55284-4","display":"Blood Pressure"}]},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/70677dff-e863-4728-a537-9bb853beae72"},"effectiveDateTime":"2009-06-13T12:15:38-04:00","issued":"2009-06-13T12:15:38-04:00","component":[{"code":{"coding":[{"system":"http://loinc.org","code":"8480-6","display":"Systolic Blood Pressure"}],"text":"Systolic Blood Pressure"},"valueQuantity":{"value":106,"unit":"mmHg","system":"http://unitsofmeasure.org/","code":"mmHg"}},{"code":{"coding":[{"system":"http://loinc.org","code":"8462-4","display":"Diastolic Blood Pressure"}],"text":"Diastolic Blood Pressure"},"valueQuantity":{"value":72,"unit":"mmHg","system":"http://unitsofmeasure.org/","code":"mmHg"}}]},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/d9340819-7735-477c-8398-d2f6c094c330","resource":{"resourceType":"Observation","id":"d9340819-7735-477c-8398-d2f6c094c330","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:33:09.408-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"55284-4","display":"Blood Pressure"}]},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/d4257739-1e7e-4164-8555-23a4938c9413"},"effectiveDateTime":"2013-11-07T10:50:38-05:00","issued":"2013-11-07T10:50:38-05:00","component":[{"code":{"coding":[{"system":"http://loinc.org","code":"8480-6","display":"Systolic Blood Pressure"}],"text":"Systolic Blood Pressure"},"valueQuantity":{"value":127,"unit":"mmHg","system":"http://unitsofmeasure.org/","code":"mmHg"}},{"code":{"coding":[{"system":"http://loinc.org","code":"8462-4","display":"Diastolic Blood Pressure"}],"text":"Diastolic Blood Pressure"},"valueQuantity":{"value":84,"unit":"mmHg","system":"http://unitsofmeasure.org/","code":"mmHg"}}]},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/b67f0278-8813-4073-bdc9-8e34e1faf212","resource":{"resourceType":"Observation","id":"b67f0278-8813-4073-bdc9-8e34e1faf212","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:34:35.349-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"29463-7","display":"Body Weight"}],"text":"Body Weight"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/c5c4d1a9-5f7a-40e0-8dd8-1bbd38f1e02b"},"effectiveDateTime":"2011-06-21T01:49:44-04:00","issued":"2011-06-21T01:49:44-04:00","valueQuantity":{"value":101.53925065959633,"unit":"kg","system":"http://unitsofmeasure.org/","code":"kg"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/ab3e6b07-0823-4704-8227-a1249465a86c","resource":{"resourceType":"Observation","id":"ab3e6b07-0823-4704-8227-a1249465a86c","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:36:28.851-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"39156-5","display":"Body Mass Index"}],"text":"Body Mass Index"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/c5c4d1a9-5f7a-40e0-8dd8-1bbd38f1e02b"},"effectiveDateTime":"2011-06-21T01:49:44-04:00","issued":"2011-06-21T01:49:44-04:00","valueQuantity":{"value":44.46872377686395,"unit":"kg/m2","system":"http://unitsofmeasure.org/","code":"kg/m2"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Observation/c69e6e59-cc67-4e27-bf7f-bd6f15f35ad8","resource":{"resourceType":"Observation","id":"c69e6e59-cc67-4e27-bf7f-bd6f15f35ad8","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:38:13.156-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"status":"final","category":{"coding":[{"system":"http://hl7.org/fhir/observation-category","code":"vital-signs"}]},"code":{"coding":[{"system":"http://loinc.org","code":"8302-2","display":"Body Height"}],"text":"Body Height"},"subject":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"encounter":{"reference":"Encounter/d4257739-1e7e-4164-8555-23a4938c9413"},"effectiveDateTime":"2013-11-07T10:50:38-05:00","issued":"2013-11-07T10:50:38-05:00","valueQuantity":{"value":151.10876084786392,"unit":"cm","system":"http://unitsofmeasure.org/","code":"cm"}},"search":{"mode":"match"}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Encounter/eb306de2-f4a2-47ee-ad3e-b22f6bc2bd3e","resource":{"resourceType":"Encounter","id":"eb306de2-f4a2-47ee-ad3e-b22f6bc2bd3e","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:13:26.491-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}]},"status":"finished","class":"outpatient","type":[{"coding":[{"system":"http://snomed.info/sct","code":"185349003"}],"text":"Outpatient Encounter"}],"patient":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"period":{"start":"2015-11-07T04:41:40-05:00","end":"2015-11-07T05:41:40-05:00"},"serviceProvider":{"reference":"Organization/04fbd479-21db-417c-aaed-412ac4463efb"}}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Encounter/70677dff-e863-4728-a537-9bb853beae72","resource":{"resourceType":"Encounter","id":"70677dff-e863-4728-a537-9bb853beae72","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:10:22.976-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}]},"status":"finished","class":"outpatient","type":[{"coding":[{"system":"http://snomed.info/sct","code":"185349003"}],"text":"Outpatient Encounter"}],"patient":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"period":{"start":"2009-06-13T12:15:38-04:00","end":"2009-06-13T13:15:38-04:00"},"serviceProvider":{"reference":"Organization/04fbd479-21db-417c-aaed-412ac4463efb"}}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Encounter/c5c4d1a9-5f7a-40e0-8dd8-1bbd38f1e02b","resource":{"resourceType":"Encounter","id":"c5c4d1a9-5f7a-40e0-8dd8-1bbd38f1e02b","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:10:38.191-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}]},"status":"finished","class":"outpatient","type":[{"coding":[{"system":"http://snomed.info/sct","code":"185349003"}],"text":"Outpatient Encounter"}],"patient":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"period":{"start":"2011-06-21T01:49:44-04:00","end":"2011-06-21T02:49:44-04:00"},"serviceProvider":{"reference":"Organization/04fbd479-21db-417c-aaed-412ac4463efb"}}},{"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Encounter/d4257739-1e7e-4164-8555-23a4938c9413","resource":{"resourceType":"Encounter","id":"d4257739-1e7e-4164-8555-23a4938c9413","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:11:31.618-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}]},"status":"finished","class":"outpatient","type":[{"coding":[{"system":"http://snomed.info/sct","code":"185349003"}],"text":"Outpatient Encounter"}],"patient":{"reference":"Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"},"period":{"start":"2013-11-07T10:50:38-05:00","end":"2013-11-07T11:50:38-05:00"},"serviceProvider":{"reference":"Organization/04fbd479-21db-417c-aaed-412ac4463efb"}}},{"resource":{"resourceType":"Patient","id":"c7ec9560-58cd-4a08-874b-91e3429ef1d6","meta":{"versionId":"1","lastUpdated":"2018-05-07T13:10:22.943-04:00","tag":[{"system":"https://smarthealthit.org/tags","code":"synthea-8-2017"}],"extension":[{"url":"http://hl7.org/fhir/4.0/StructureDefinition/extension-Meta.source","valueUri":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir"}]},"text":{"status":"generated","div":"<div xmlns=\"http://www.w3.org/1999/xhtml\">Generated by <a href=\"https://github.com/synthetichealth/synthea\">Synthea</a>. Version identifier: 1a8d765a5375bf72f3b7a92001940d05a6f21189</div>"},"extension":[{"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race","valueCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/v3/Race","code":"2106-3","display":"White"}],"text":"race"}},{"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity","valueCodeableConcept":{"coding":[{"system":"http://hl7.org/fhir/v3/Ethnicity","code":"2186-5","display":"Nonhispanic"}],"text":"ethnicity"}},{"url":"http://hl7.org/fhir/StructureDefinition/birthPlace","valueAddress":{"city":"Springfield","state":"MA","country":"US"}},{"url":"http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName","valueString":"Gretchen Dach"},{"url":"http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex","valueCode":"F"},{"url":"http://hl7.org/fhir/StructureDefinition/patient-interpreterRequired","valueBoolean":false}],"identifier":[{"system":"https://github.com/synthetichealth/synthea","value":"7dd5adc3-9790-4f46-a428-9fe44803e71a"},{"type":{"coding":[{"system":"http://hl7.org/fhir/identifier-type","code":"SB"}]},"system":"http://hl7.org/fhir/sid/us-ssn","value":"999483974"},{"type":{"coding":[{"system":"http://hl7.org/fhir/v2/0203","code":"DL"}]},"system":"urn:oid:2.16.840.1.113883.4.3.25","value":"S99914780"},{"type":{"coding":[{"system":"http://hl7.org/fhir/v2/0203","code":"MR"}]},"system":"http://hospital.smarthealthit.org","value":"7dd5adc3-9790-4f46-a428-9fe44803e71a"}],"name":[{"use":"official","family":["Towne"],"given":["Caren"],"prefix":["Ms."]}],"telecom":[{"system":"phone","value":"618-820-8880","use":"home"}],"gender":"female","birthDate":"1966-12-11","address":[{"extension":[{"url":"http://hl7.org/fhir/StructureDefinition/geolocation","extension":[{"url":"latitude","valueDecimal":42.599686038693555},{"url":"longitude","valueDecimal":-71.80711557602227}]}],"line":["226 Lisandro Mills","Suite 333"],"city":"Fitchburg","state":"MA","postalCode":"01420","country":"US"}],"maritalStatus":{"coding":[{"system":"http://hl7.org/fhir/v3/MaritalStatus","code":"S"}],"text":"S"},"multipleBirthBoolean":false,"communication":[{"language":{"coding":[{"system":"http://hl7.org/fhir/ValueSet/languages","code":"en-US","display":"English (United States)"}]}}]},"fullUrl":"http://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImoiOiIxIiwiYiI6ImM3ZWM5NTYwLTU4Y2QtNGEwOC04NzRiLTkxZTM0MjllZjFkNiJ9/fhir/Patient/c7ec9560-58cd-4a08-874b-91e3429ef1d6"}],"files":[],"errorLog":[],"errorCount":0}
	}]
}

const fhirLoader = new FhirLoader();
const ghExporter = new GithubExporter();

const createUniqueId = () => Math.random().toString(36);
const actions = store => {
	store.on("@init", () => initialState);
	store.on("uiState/set", (state, uiState) => { 
		return { uiState }
	});
	store.on("uiState/merge", ({ uiState }, newUiState) => {
		return {uiState: {...uiState, ...newUiState}}
	})
	store.on("uiState/incrementCounts", ({ uiState }, counts) => {
		Object.keys(counts).forEach( countType => {
			counts[countType] = counts[countType] + (uiState[countType] || 0)
		});	
		return {uiState: {...uiState, ...counts}}
	})
	store.on("nonModalUi/merge", ({ nonModalUi }, newState) => {
		return {nonModalUi: {...(nonModalUi ||{}), ...newState}}
	});
	store.on("providers/add", ({ providers }, provider) => {
		if (!provider.id) provider.id = createUniqueId();
		console.log(provider)
		return {providers: providers.concat([provider])}
	});
	store.on("providers/update", ({ providers }, provider) => {
		return {
			providers: providers.map( p => {
				return (p.id !== provider.id) 
					? p 
					: {...p, ...provider}
			})
		}
	});
	store.on("providers/upsert", (state, provider) => {
		if (!provider.id) {
			provider.id = createUniqueId();
			store.dispatch("providers/add", provider);
		} else {
			store.dispatch("providers/update", provider);
		}
	});
	store.on("providers/upsertAndLoad", (state, provider) => {

		store.dispatch("providers/upsert", provider);
		store.dispatch("fhir/loadData", provider.id);
	});
	store.on("providers/remove", ({ providers }, id) => {
		return {
			// uiState: {mode: "ready"},
			providers: providers.filter( p => {
				return p.id !== id
			})
		}
	});
	store.on("config/load", (state) => {
		store.dispatch("uiState/set", {mode: "loading"});
		ConfigLoader.loadConfigFile("./config/config.json")
			.then( config => {
				store.dispatch("config/merge", config);
				store.dispatch("uiState/set", {mode: "pushToGithub"});
			})
			.catch( e => {
				store.dispatch("uiState/set", {
					mode: "globalError", 
					error: e
				});
			})
	});
	store.on("config/merge", (state, newConfig) => {
		return {...state, ...newConfig}
	});
	store.on("fhir/loadData", ({ providers, queryProfiles, mimeTypeMappings, dateSortElements }, providerId) => {
		const provider = providers.find(p => p.id === providerId);
		const queries = queryProfiles[provider.queryProfile].queries;

		const handleLoadDone = (data) => {
			store.dispatch("uiState/set", {
				mode: "loadData",
				submode: "loaded",
				data: data,
				id: provider.id
			});
		}

		const handleStatusUpdate = (url, isError) => {
			if (console) console.log("Fetching: ", url);
			store.dispatch("uiState/incrementCounts", {
				requestCount: 1,
				errorCount: isError ? 1 : 0,
			})
		}
		
		const loadFhir = (context) => {
			store.dispatch("uiState/merge", {submode: "loading"});
			fhirLoader.getFHIR(provider, queries, context, true, mimeTypeMappings, dateSortElements, handleStatusUpdate)
				.then(handleLoadDone)
				.catch(handleGlobalError);
		}

		const handleGlobalError = (e) => {
			//don't show error if user clicked the cancel button
			if (e.message === "cancelled" || e.name === "AbortError")
				return;
			
				store.dispatch("uiState/set", {
					mode: "loadData",
					submode: "error",
					status: e.message || e,
					id: provider.id
				});
		}

		if (!provider.isOpen) {
			store.dispatch("uiState/set", {
				mode: "loadData",
				submode: "authorizing",
				id: provider.id
			});
			fhirLoader.authAndGetFHIR(provider)
				.then(loadFhir)
				.catch(handleGlobalError);
		} else {
			store.dispatch("uiState/set", {
				mode: "loadData",
				submode: "loading",
				id: provider.id	
			});		
			loadFhir()
		}
	});
	store.on("fhir/cancelLoad", () =>  {
		fhirLoader.cancel();
		store.dispatch("uiState/set", {mode: "ready"});
	});
	store.on("export/download", ({ providers }, id) => {
		store.dispatch("providers/update", {id, uiStatus:"downloading"})
		const provider = providers.find(p => p.id === id);
		ZipExporter.exportProvider(provider)
			.then( () => {
				store.dispatch("providers/update", {
					id, uiStatus: null
				});
			});
	});
	store.on("export/downloadAll", ({ providers }) => {
		store.dispatch("nonModalUi/merge", {isDownloading: true})
		ZipExporter.exportProviders(providers)
			.catch( e => {
				store.dispatch("uiState/set", {
					mode: "globalError", 
					error: e
				});
			})
			.finally( () => {
				store.dispatch("nonModalUi/merge", {isDownloading: false})
			});
	});
	store.on("export/github", ( {githubConfig, providers} ) => {
		
		const statusCallback = (status, statusUrl) => {
			store.dispatch("uiState/merge", { status, statusUrl });
		}

		store.dispatch("uiState/merge", {
			submode: "push",
			error: null
		});

		ghExporter.export(
			providers, githubConfig, statusCallback
		)
			.then( () => {
				store.dispatch("uiState/merge", {
					submode: null
				});
			})
			.catch( e => {
				store.dispatch("uiState/set", {
					mode: "githubExport",
					error: e.message === "canceled" ? null : e.message
				});
			});

	})
	store.on("export/github/cancel", () => {
		ghExporter.cancel();
		store.dispatch("uiState/set", { 
			mode: "githubExport"
		});
	})
}

const store = createStore([actions]);

export default store;