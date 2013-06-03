var newParameterized = require('./newParameterized');
var extractAlias = require('./extractAlias');
var operator = ' LIKE ';

function contains(column,arg,optionalAlias) {
	var alias = extractAlias(optionalAlias);
	arg =  '%' + arg + '%';
	var encoded = column.purifyThenEncode(arg);	
	var firstPart = alias + '.' + column.name + operator;
	return encoded.prepend(firstPart);		
};

module.exports = contains;