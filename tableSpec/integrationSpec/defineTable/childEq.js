function act(c) {
	c.expected = "select _0.oOrderId as s_00,_0.oCustomerId as s_01 from order _0 where EXISTS (SELECT _1.cCustomerId FROM customer AS _1 WHERE _0.oCustomerId=_1.cCustomerId AND _1.cName='lars') AND _0.discriminatorColumn='foo' AND _0.discriminatorColumn2='baz' order by _0.oOrderId";
	c.filter = c.orderTable.customer.name.eq('lars');	
	c.newQuery();
	
}

module.exports = act;