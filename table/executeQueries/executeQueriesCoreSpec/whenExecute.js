var when = require('a').when;
var c = {};

when(c).
	it('should return results').assertDeepEqual(c.expected,c.returned);
