let cls = require('./node-cls');
const fs = require('fs');
const log = (str) => fs.writeSync(1, `${str}\n`);

function begin(id) {
	return new Promise((resolve) => {
		let context = cls.getContext();
		context.id = id;
		resolve();
	});
}

function getById() {
	return new Promise((resolve) => {
		let context = cls.getContext();
		context.id;
		resolve(context.id);
	});
}

async function getFromDb() {
	let c = cls.createContext();
	await c.start();
	await begin(1);
	await new Promise((resolve) => {
		setTimeout(resolve(), 500);
	});
	await getFromDb2();

	let c3 = cls.createContext();
	await c3.start();
	await begin(3);
	let id3 = await getById();
	if (id3 !== 3)
		throw new Error('3 Unexpected context id : ' + id3);
	cls.exitContext();

	await getFromDb3();

	let id = await getById();
	if (id !== 1)
		throw new Error('1 Unexpected context id : ' + id);
	cls.exitContext();
}

function getFromDb2() {
	return new Promise((resolve) => {
		setTimeout(async() => {
			let c2 = cls.createContext();
			await c2.start();
			await begin(2);
			let id2 = await getById();
			if (id2 !== 2)
				throw new Error('2 Unexpected context id : ' + id2);
			id2 = cls.active.id;
			if (id2 !== 2)
				throw new Error('2 Unexpected context id : ' + id2);
			cls.exitContext();
			resolve();
		}, 500);
	});
}

async function getFromDb3() {
	let c3 = cls.createContext();
	await c3.start();
	await begin(3);
	let id3 = await getById();
	if (id3 !== 3)
		throw new Error('3 Unexpected context id : ' + id3);
	cls.exitContext();
}


async function testStart() {
	await getFromDb();
}

testStart().then(() => log('done'), (e) => log(e.stack));
