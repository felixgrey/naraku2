const Utils = require('./../../lib/Utils/index.js');

const {
	equalAssert,
	equalLog,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	Container,
} = require('./../TestTools.js');
require('./Init-Fetcher0.js');

// ----------------------------------------------------------- //
const testName = 'DataHub';
const Component = require(`../../lib/DataHub/${testName}.js`).default;
// ----------------------------------------------------------- //

// let container = new Container();

console.log(`\n--------- test ${testName} start ---------\n`);

Utils.createLog.showPublicMethods = false;

const devLog = Utils.createLog('DataHub','log');
const errLog = Utils.createLog('DataHub','error');

let component = new Component({}, devLog, errLog, true);

console.log(`\n--- ${testName}.destroy() ---\n`);
component.destroy();

console.log(`\n--- ${testName} ---\n`);
component = new Component({
	testData1: [1,2,3]
}, devLog, errLog, true);





console.log(`\n--------- test ${testName} end   ---------\n`);