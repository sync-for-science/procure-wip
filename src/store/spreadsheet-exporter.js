import _ from "lodash";
import XlsxPopulate from "xlsx-populate";
import saveAs from "file-saver";
import sanitizeFilename from "sanitize-filename";
import mergeObjects from "./merge-objects.js";
import csvWriter from "./csv-writer";

const defaultHelperFns = {
	validateExists: v => {
		return v !== undefined
	},
	validateCode: (v, template) => {
		if (!v) return false;
		if (!Array.isArray(v)) v = [v];
		return v.find( c => c.code === template.target ) ? true : false;
	},
	validateCodeableConcept: (v, template) => {
		if (!v) return false;
		if (!Array.isArray(v)) v = [v];
		return v.find( cc => {
			return cc.coding.find( c => c.code === template.target ) 
		}) ? true : false;
	},
	validateValue: (v, template) => {
		return v === template.target;
	},
	getHelperData: (v, template, helperData) => {
		return helperData[template.helperDataField];
	},
	stringifyCodings: v => {
		if (!v) return v;
		if (!Array.isArray(v)) v = [v];
		return v
			.map( c => c.system + "|" + c.code )
			.join(" ");
	},
	parseDateForExcel:  (v, template, helperData) => {
		return (v && helperData.format !== "csv")
			? new Date(v) 
			: v;
	}
}

function flatten(element, template, helperData={}, helperFns) {
	helperFns = helperFns || defaultHelperFns;
	let rows = [];
	_.each(template, field => {

		const mergeRows = (rowsToMerge) => {
			if (rows.length === 0) rows = [{}];
			let newRows = [];
			_.each(rowsToMerge, mergeRow => {
				if (!_.isArray(mergeRow)) mergeRow = [mergeRow];
				_.each(mergeRow, mergeRowItem => {
					_.each(rows, row => {
						newRows.push({ ...row, ...mergeRowItem});
					});
				});
			});
			rows = newRows;
		}

		if (!_.isArray(field.path))
			field.path = [field.path];

		let data = _.chain(element)
			.at(element, field.path)
			.filter( v => v !== undefined )
			.first().value();

		//allow a fallback path. Note: this will always be evaluated last regardless of array position
		if (!data && field.path.indexOf("*") > -1) 
			data = element;

		if (field.transform)
			data = helperFns[field.transform](data, field, helperData);

		const valid = 
			field.test === undefined || helperFns[field.test](data, field, helperData);

		// console.log(valid, field, data)

		if (!valid) {
			rows = null;
			return false;
		} else if (field.children) {
			if (!_.isArray(data)) data = [data];
			const childRows = _.map( data, childElement => {
				return flatten(childElement, field.children, helperData, helperFns);
			});
			//check if all children were valid and bail if they weren't
			if (childRows.indexOf(null) > -1) {
				rows = null;
				return false;
			} else {
				mergeRows(childRows);
			}
		} else if (field.name) {
			if (!_.isArray(data)) data = [data];
			const rowsToMerge = data.map( item => ({[field.name]: item}) );
			mergeRows(rowsToMerge);
		}
	})
	return rows;
}

function flattenProviders(providers, template, helperData={}, helperFns) {
	return _.chain(providers)
		.filter( p => p.selected && p.data && p.data.entry && p.data.entry.length > 0)
		.map( p => {
			return _.chain(p.data.entry).map( e => {
				const providerHelperData = {...helperData, source: p.name};
				return flatten(e.resource, template, providerHelperData, helperFns);
			}).flatten().value()
		})
		.flatten()
		.filter( f => f !== null )
		.value();
}

function getTemplateColumns(template) {
	let cols = [];
	const arrayToCols = templateArray => {
		_.each(templateArray, field => {
			if (field.name) cols.push(field.name);
			if (field.children) arrayToCols(field.children);
		});
	}
	arrayToCols(template || template.template);
	return cols;
}

// JS Excel libraries with browser compatibility (others are node.js only)
// https://github.com/SheetJS/js-xlsx (Apache2, very robust, support for .xls, formatting requires commercial license)
// https://github.com/dtjohnson/xlsx-populate (MIT, good option)
// https://github.com/exceljs/exceljs (MIT, good option, slightly more dependencies)
// https://github.com/egeriis/zipcelx (MIT, very light weight, currently no date support)
// https://en.wikipedia.org/wiki/Microsoft_Office_XML_formats#Excel_XML_Spreadsheet_example (Excel 2003, seems to not require zip)

function exportFlatDataCSV(flatData, template, name) {
	const columns = getTemplateColumns(template);
	const data = flatData.map( row => {
		return columns.map( col =>  row[col] );
	});
	const blob = csvWriter([columns].concat(data));
	return new Promise( (resolve) => {
		saveAs(blob, sanitizeFilename(name) + ".csv")
		resolve();
	})
}

function exportFlatDataExcel(flatData, template, name) {
	const columns = getTemplateColumns(template);
	let dateCols = [];
	const data = flatData.map( row => {
		return columns.map( (col, i) => {
			if (row[col] instanceof Date && dateCols.indexOf(i+1) === -1)
				dateCols.push(i+1);
			return row[col] 
		});
	});

	return XlsxPopulate.fromBlankAsync()
    	.then( workbook => {
			workbook.sheet(0).name(name)
				.cell("A1").value(
					[columns].concat(data)
				)
			dateCols.forEach( dateCol => {
				workbook.sheet(0).column(dateCol)
					.style("numberFormat", "dddd, mmmm dd, yyyy");
			});
			return workbook.outputAsync()
		})
		.then( blob => {
			saveAs(blob, sanitizeFilename(name) + ".xlsx");
		});
}

function exportSpreadsheet(providers, spreadsheetTemplates, templateId, format) {
	const templateDefinition = spreadsheetTemplates[templateId];

	const templateDefinitions = _.map( (templateDefinition.extends||[]),
		id => spreadsheetTemplates[id]
	).concat([templateDefinition]);

	const mergedTemplateDefinition = mergeObjects.merge(templateDefinitions);	
	let flatData = flattenProviders(providers, mergedTemplateDefinition.template, { format });

	if (mergedTemplateDefinition.sortBy) {
		const sortBy = _.map(mergedTemplateDefinition.sortBy, s => s.name);
		const sortDir = _.map(mergedTemplateDefinition.sortBy, s => s.dir || "desc");
		flatData = _.orderBy(flatData, sortBy, sortDir);
	}
	
	//csv exporter has a bug with undefined values - change to null
	flatData = flatData.map( row => {
		return _.mapValues(row, v => v === undefined ? null : v )
	})

	if (format === "xlsx") {
		return exportFlatDataExcel(flatData, mergedTemplateDefinition.template, mergedTemplateDefinition.name)
	} else {
		return exportFlatDataCSV(flatData, mergedTemplateDefinition.template, mergedTemplateDefinition.name)
	}
}


export default { 
	flatten, flattenProviders, 
	defaultHelperFns, exportSpreadsheet
}