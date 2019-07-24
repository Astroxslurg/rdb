let useHook = require('../useHook');
let cls = require('../node-cls');

if (useHook)
	module.exports = function () {
		delete cls.getContext('rdb').rdb;
	}
else
	module.exports = function () {
		delete process.domain.rdb;
	}