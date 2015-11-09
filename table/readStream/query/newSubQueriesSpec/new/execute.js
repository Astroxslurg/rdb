var a = require('a'),
	mock = a.mock,
	requireMock = a.requireMock,
	table = {},
	filter = {},
	span = {},
	alias = 'alias',
	legs = {},
	joinLeg = {},
	manyLeg = {},
	oneLeg = {},
	innerJoin = {},
	manyLegQuery = {},
	oneLegQuery = {},
	joinLegQuery = {},
	joinLegNo = {},
	manyLegNo = {},
	oneLegNo = {};


function act(c) {	
	stubLegs();
	stubSpan();
	c.manyLegToQuery = requireMock('./newSubQueries/manyLegToQuery');
	c.manyLegToQuery.expect(alias,manyLeg,manyLegNo).return(manyLegQuery);
	c.manyLegQuery.sql = c.mock();
	c.manyLegSql = '<manyLegSql>';
	c.manyLegQuery.sql.expect().return(c.manyLegSql);
	
	c.oneLegToQuery = requireMock('./newSubQueries/oneLegToQuery');
	c.oneLegToQuery.expect(alias,oneLeg,oneLegNo).return(oneLegQuery);
	c.oneLegSql = '<oneLegSql>';
	c.oneLegQuery.sql.expect().return(c.oneLegSql);


	c.joinLegToQuery = requireMock('./newSubQueries/joinLegToQuery');
	c.joinLegToQuery.expect(alias,joinLeg,joinLegNo).return(joinLegQuery);
	c.joinLegSql = '<joinLegSql>';
	c.joinLegQuery.sql.expect().return(c.joinLegSql);


	c.sut(table,span,alias);
}

function stubLegs() {
	joinLeg.accept = mock();
	joinLeg.accept.expectAnything().whenCalled(function(visitor) {visitor.visitJoin(joinLeg)});
	oneLeg.accept = mock();
	oneLeg.accept.expectAnything().whenCalled(function(visitor) {visitor.visitOne(oneLeg)});
	manyLeg.accept = mock();
	manyLeg.accept.expectAnything().whenCalled(function(visitor) {visitor.visitMany(manyLeg)});
}

function stubSpan() {
	span.legs = legs;
	legs.forEach = mock();
	legs.forEach.expectAnything().whenCalled(onEach); 
}

function onEach(callback) {
	callback(joinLeg,joinLegNo);
	callback(oneLeg,oneLegNo);
	callback(manyLeg,manyLegNo);
}

module.exports = act;