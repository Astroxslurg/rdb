function act(c){
	c.column1 = {};
	c.column1._dbName = 'colName1';
	c.column2 = {};
	c.column2._dbName = 'colName2';
	c.table._primaryColumns = [c.column1, c.column2];

	c.expected = ' order by alias.colName1,alias.colName2'
	c.returned = c.sut(c.table, c.alias, undefined);
}

module.exports = act;