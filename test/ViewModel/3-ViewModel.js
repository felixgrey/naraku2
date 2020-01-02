const Utils = require('./../../lib/Utils/index.js');

const {
	equalAssert,
	equalLog,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
} = require('./../TestTools.js');

// ----------------------------------------------------------- //
const testName = 'ViewModel';
const Component = require(`../../lib/ViewModel/${testName}.js`).default;
// ----------------------------------------------------------- //

const devLog = Utils.createLog(testName,'log');
const errLog = Utils.createLog(testName,'error');

console.log(`\n--------- test ${testName} start ---------\n`);

let component = new Component(devLog, errLog, true);

console.log(`\n--- ${testName}.destroy() ---\n`);
component.destroy();

console.log(`\n--------- ${testName} ---------\n`);

component = new Component(devLog, errLog, true);


console.log(`\n--------- test ${testName} end   ---------\n`);