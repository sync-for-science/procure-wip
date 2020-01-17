export default (rows) => {
	const processRow = (row) => {
		return row.map( rawValue => {
			let value = rawValue === null ? "" : rawValue.toString();
			if (rawValue instanceof Date)
				value = rawValue.toLocaleString();
			value = value.replace(/"/g, '""');
			if (value.search(/("|,|\n)/g) >= 0)
				value = '"' + value + '"';
			return value;
		}).join(",");
	};

	const csv = rows.map(processRow).join("\n");
	return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}