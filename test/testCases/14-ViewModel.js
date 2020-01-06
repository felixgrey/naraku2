const {
	equalAssert,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./../TestTools/TestTools.js');

const Utils = require('./../../lib/Utils/index.js');
require('./../TestTools/Init-Fetcher0.js');

const testName = 'ViewModel'
const Component = require(`../../lib/ViewModel/${testName}.js`).default;
const ViewContext = require(`../../lib/ViewModel/ViewContext.js`).default;
let component

// console.log(`\n=============== ${testName} start ===============\n`);
// component = new Component({}, null, getUnion());

// console.log(`\n--------------  ${testName} destroy --------------`);
// component.destroy();

console.log(`\n--------------  ${testName} --------------`);

let union = getUnion();

let viewContext = new ViewContext({}, union);

component = new Component({}, null, viewContext, union);
// ----------------------------------------------------------- //


console.log(`\n=============== ${testName} end ===============\n`);