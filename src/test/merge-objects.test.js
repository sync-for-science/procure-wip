import mergeObjects from "../store/merge-objects.js";

describe("Merge templates", () => {

	test("merge keys in objects, replacing values where fields overlap", () => {
		const baseTemplate = {a:"a", b:"b"};
		const newTemplate = {a:"a1"};
		const merged = mergeObjects.merge([baseTemplate, newTemplate]);
		expect(merged).toEqual( {a:"a1", b:"b"} );		
	})

	test("merge nested keys", () => {
		const baseTemplate = {
			b: {
				c: {d:"d1", e:"e1"}
			}
		};
		const newTemplate = {b: { c: {e: "e2", f:"f1"} } };
		const merged = mergeObjects.merge([baseTemplate, newTemplate]);
		expect(merged).toEqual({
			b: {
				c: {d:"d1", e:"e2", f:"f1"}
			}
		});	
	})

	test("override properties with leading underscores", () => {
		const baseTemplate = {
			b: {
				c: {d:"d1", e:"e1"}
			}
		};
		const newTemplate = {b: { _c: {e: "e2", f:"f1"} } };
		const merged = mergeObjects.merge([baseTemplate, newTemplate]);
		expect(merged).toEqual({
			b: {
				c: {e: "e2", f:"f1"}
			}
		});	
	});

	test("merge objects in arrays with matching ids", () => {
		const baseTemplate = {
			a: [ {id: "b", c:"c1", d:"d1"}, {d:"d1"} ]
		};
		const newTemplate = { a: [{id:"b", c:"c2"}] };
		const merged = mergeObjects.merge([baseTemplate, newTemplate]);
		expect(merged).toEqual({
			a: [ {id: "b", c:"c2", d:"d1"}, {d:"d1"} ]
		});	
	})

	test("append objects in arrays with non-matching ids", () => {
		const baseTemplate = {
			a: [ {id: "b", c:"c1", d:"d1"}, {d:"d1"} ]
		};
		const newTemplate = { a: [{id:"b1", c:"c2"}] };
		const merged = mergeObjects.merge([baseTemplate, newTemplate]);
		expect(merged).toEqual({
			a: [ {id: "b", c:"c1", d:"d1"}, {d:"d1"}, {id:"b1", c:"c2"} ]
		});	
	})

	test("remove objects in array with underscore property", () => {
		const baseTemplate = {
			a: [ {id: "b", c:"c1", d:"d1"}, {d:"d1"} ]
		};
		const newTemplate = { a: [{id:"b", _:true}] };
		const merged = mergeObjects.merge([baseTemplate, newTemplate]);
		expect(merged).toEqual({
			a: [ {d:"d1"} ]
		});	
	})

	test("merge array of strings", () => {
		const baseTemplate = {
			a: [ "one", "two" ]
		};
		const newTemplate = { a: ["three"] };
		const merged = mergeObjects.merge([baseTemplate, newTemplate]);
		expect(merged).toEqual({
			a: [ "one", "two", "three" ]
		});	
	})

	test("merge template with just an array", () => {
		const baseTemplate = [
			{"path": "resourceType", "test": "validateValue", "target": "Observation"},
			{"path": "category", "test": "validateValue", "target": "vital-sign", "id": "category"},
			{"name": "Source", "transform": "getHelperData", "helperDataField": "source"}
		]
		const newTemplate = [
			{"id":"category", "target":"laboratory"}
		];
		const merged = mergeObjects.merge([baseTemplate, newTemplate]);
		expect(merged).toEqual([
			{"path": "resourceType", "test": "validateValue", "target": "Observation"},
			{"path": "category", "test": "validateValue", "target": "laboratory", "id": "category"},
			{"name": "Source", "transform": "getHelperData", "helperDataField": "source"}
		]);	
	})

	test("merge multiple templates", () => {
		const templates = [
			{a:"a", b:"b"},
			{a:"a1"},
			{c: "c"}
		];
		const merged = mergeObjects.merge(templates);
		expect(merged).toEqual( {a:"a1", b:"b", c:"c"} );
	})
});
