import _ from "lodash";

//matching object keys merge properties
//if key has an underscore, then object is replaced
//arrays items merge by id, appending otherwise
//array items with an underscore property replace all properties
//objects item with an underscore property are deleted
function merge(templates) {

	const mergeArray = (base, override) => {
		_.each(override, overrideItem => {
			const baseIndex = overrideItem.id 
				? _.findIndex(base, b => b.id === overrideItem.id) 
				: -1;
			if (overrideItem._) {
				if (baseIndex > -1) base.splice(baseIndex, 1); 
			} else if (baseIndex > -1) {
				base[baseIndex] = mergeObject(base[baseIndex], overrideItem);
			} else {
				base.push(overrideItem)
			}
		});
		return base;
	}

	const mergeObject = (base, override) => {
		_.each( _.keys(override), key => {
			if (key[0] === "_") {
				base[key.slice(1)] = override[key];
			} else if (base[key] === undefined) {
				base[key] = override[key];
			} else if (_.isPlainObject(override[key]) && override[key]._) {
				delete base[key];
			} else if (_.isPlainObject(override[key])) {
				base[key] = mergeObject(base[key], override[key]);
			} else if (_.isArray(base[key]) && _.isArray(override[key])) {
				base[key] = mergeArray(base[key], override[key]);
			} else {
				base[key] = override[key];
			}
		})
		return base;
	}

	let base = JSON.parse(JSON.stringify(templates[0]));
	_.each( templates, (template, i) => {
		if (i === 0) return;
		template = JSON.parse(JSON.stringify(template));
		if (_.isPlainObject(base) && _.isPlainObject(template)) {
			base = mergeObject(base, template)
		} else if (_.isArray(base) && _.isArray(template)) {
			base = mergeArray(base, template);
		} else {
			base = template;
		}
	})
	return base;

}

export default { merge };