/* eslint-disable require-atomic-updates */
let applyPatch = require('./applyPatch');
let fromCompareObject = require('./fromCompareObject');

async function patchTable(table, patches, { defaultConcurrency = 'optimistic', concurrency = {} } = {}) {
	for (let i = 0; i < patches.length; i++) {
		let patch = {path: undefined, value: undefined, op: undefined};
		Object.assign(patch, patches[i]);
		patch.path = patches[i].path.split('/').slice(1);
		if (patch.op === 'add' || patch.op === 'replace')
			await add({ path: patch.path, value: patch.value, op: patch.op, oldValue: patch.oldValue, concurrency: concurrency }, table);
		else if (patch.op === 'remove')
			await remove(patch, table);
	}

	async function add({ path, value, op, oldValue, concurrency = {} }, table, row, parentRow, relation) {
		let property = path[0];
		path = path.slice(1);
		if (!row && path.length > 0)
			row = row || await table.tryGetById(property);
		if (path.length === 0) {
			let pkName = table._primaryColumns[0].alias;
			row = table.insert(value[pkName]);
			for (let name in value) {
				row[name] = fromCompareObject(value[name]);
			}
			if (relation && relation.joinRelation) {
				let fkName = relation.joinRelation.columns[0].alias;
				let parentPk = relation.joinRelation.childTable._primaryColumns[0].alias;
				if (!row[fkName])
					row[fkName] = parentRow[parentPk];
			}
			return;
		}
		property = path[0];
		if (isColumn(property, table)) {
			let dto = {};
			dto[property] = row[property];
			let result = applyPatch({ defaultConcurrency, concurrency }, dto, [{ path: '/' + path.join('/'), op, value, oldValue }]);
			row[property] = result[property];
		}
		else if (isOneRelation(property, table)) {
			let relation = table[property]._relation;
			await add({ path, value, op, oldValue, concurrency: concurrency[property] }, relation.childTable, await row[property], row, relation);
		}
		else if (isManyRelation(property, table)) {
			let relation = table[property]._relation;
			if (path.length === 1) {
				for (let id in value) {
					await add({ path: [id], value: value[id], op, oldValue, concurrency: concurrency[property] }, relation.childTable, {}, row, relation);
				}
			}
			else
				await add({ path: path.slice(1), value, oldValue, op, concurrency: concurrency[property] }, relation.childTable, undefined, row, relation);
		}
	}

	async function remove({ path, value, op }, table, row) {
		let property = path[0];
		path = path.slice(1);
		row = row || await table.getById(property);
		if (path.length === 0)
			return row.cascadeDelete();
		property = path[0];
		if (isColumn(property, table)) {
			let dto = {};
			dto[property] = row[property];
			let result = applyPatch({defaultConcurrency: 'overwrite', concurrency: undefined}, dto, [{ path: '/' + path.join('/'), op }]);
			row[property] = result[property];
		}
		else if (isOneRelation(property, table)) {
			let child = await row[property];
			if (!child)
				throw new Error(property + ' does not exist');
			await remove({ path, value, op }, table[property], child);
		}
		else if (isManyRelation(property, table)) {
			let relation = table[property]._relation;
			if (path.length === 1) {
				let children = (await row[property]).slice(0);
				for (let i = 0; i < children.length; i++) {
					let child = children[i];
					await remove({ path: path.slice(1), value, op }, table[property], child);
				}
			}
			else
				await remove({ path: path.slice(1), value, op }, relation.childTable);
		}
	}

	function isColumn(name, table) {
		return table[name] && table[name].equal;
	}

	function isManyRelation(name, table) {
		return table[name] && table[name]._relation.isMany;
	}

	function isOneRelation(name, table) {
		return table[name] && table[name]._relation.isOne;
	}
}

module.exports = patchTable;