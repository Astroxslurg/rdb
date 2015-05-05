var a = require('a');
var mock = a.mock;
var requireMock = a.requireMock;

function act(c){
	c.mock = a.mock;
	c.rows = {};
	c.span = {};
	c.result = {};
	c.table = {};
	c.legs = {};
	c.oneLeg = {};
	c.joinLeg = {};
	c.manyLeg = {};
	c.manySubSpan = 'sub1';
	c.joinSubSpan = 'sub2';
	c.oneSubSpan = 'sub3';
	c.span.table = c.table;
	c.span.legs = c.legs;
	c.manyLeg.span = c.manySubSpan;
	c.joinLeg.span = c.joinSubSpan;
	c.oneLeg.span = c.oneSubSpan;

	c.promise = requireMock('../promise');
	c.promise.all = c.mock();	

	c.resultToRows  = requireMock('../resultToRows');
	c.resultToRows.expect(c.manySubSpan, c.result).return(c.rows);

	stubLegs();
	
	function onEachLeg(callback) {
		callback(c.oneLeg);
		callback(c.joinLeg);
		callback(c.manyLeg);		
	}

	function stubLegs() {
		c.legs.forEach = mock();
		c.legs.forEach.expectAnything().whenCalled(onEachLeg).return();

		c.joinLeg.accept = mock();
		c.joinLeg.accept.expectAnything().whenCalled(function(visitor) {visitor.visitJoin(c.joinLeg)});
		c.oneLeg.accept = mock();
		c.oneLeg.accept.expectAnything().whenCalled(function(visitor) {visitor.visitOne(c.oneLeg)});
		c.manyLeg.accept = mock();
		c.manyLeg.accept.expectAnything().whenCalled(function(visitor) {visitor.visitMany(c.manyLeg)});
	}

	c.sut = require('../subResultToRows');
	c.subResultToRows = requireMock('./subResultToRows');
	c.oneRows = {};
	c.subResultToRows.expect(c.oneSubSpan, c.result).return(c.oneRows);
	c.joinRows = {};
	c.subResultToRows.expect(c.joinSubSpan, c.result).return(c.joinRows);

	c.expected = {};
	c.promise.all.expect([c.oneRows, c.joinRows, c.rows]).return(c.expected);

	c.returned = c.sut(c.span, c.result);
}

module.exports = act;