const Utils = require('./../../lib/Utils/index.js');

const {
	equalAssert,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./../TestTools/TestTools.js');
require('./../TestTools/Init-Fetcher0.js');

const testName = 'DataHub';
const DataHub = require(`../../lib/DataHub/DataHub.js`).default;

let dataHub;

console.log(`\n=============== ${testName} start ===============\n`);
dataHub = new DataHub({}, getUnion());

console.log(`\n--------------  ${testName} destroy --------------`);
dataHub.destroy();

console.log(`\n--------------  ${testName} --------------`);


dataHub = new DataHub({
	// test1: [1,2,3],
	test2: {
		fetcher:'test.get',
		dependence: 'test3'
	}
}, getUnion());

dataHub.getDataStore('test1').get();

dataHub.getDataStore('test3').set({aaa:'bbb'});

// ----------------------------------------------------------- //


console.log(`\n=============== ${testName} end ===============\n`);