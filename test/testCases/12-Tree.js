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

const testName = 'Tree';
const Component = require(`../../lib/ViewModel/${testName}.js`).default;

let dataHub;

console.log(`\n=============== ${testName} start ===============\n`);
component = new Component(getUnion());

console.log(`\n--------------  ${testName} destroy --------------`);
component.destroy();

console.log(`\n--------------  ${testName} --------------`);

component = new Component(getUnion());

// ----------------------------------------------------------- //

component.createNode(1, {a: 123});

component.getRoot();

component.createNode(2, {a: 123});
component.createNode(3, {a: 123});

component.getRoot();

component.setParent(3);

component.createNode(4, {a: 123});
component.createNode(5, {a: 123});

component.getParentChain(5)


console.log(JSON.stringify(component.getRoot(),null,2))


console.log(`\n=============== ${testName} end ===============\n`);