const Utils = require('./../lib/Utils/index.js');

const {
	equalAssert,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./TestTools/TestTools.js');
require('./TestTools/Init-Fetcher0.js');

const testName = 
const Component = require(`../lib/ViewModel/${testName}.js`).default;

let dataHub;

console.log(`\n=============== ${testName} start ===============\n`);
component = new Component(getUnion());

console.log(`\n--------------  ${testName} destroy --------------`);
component.destroy();

console.log(`\n--------------  ${testName} --------------`);

component = new Component(getUnion());
// ----------------------------------------------------------- //


console.log(`\n=============== ${testName} end ===============\n`);