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
const testName = 'Tree';
const Component = require(`../../lib/ViewModel/${testName}.js`).default;
// ----------------------------------------------------------- //

const devLog = Utils.createLog('Emitter','log');
const errLog = Utils.createLog('Emitter','error');

console.log(`\n--------- test ${testName} start ---------\n`);

let component = new Component(devLog, errLog, true);

console.log(`\n--- ${testName}.destroy() ---\n`);
component.destroy();

console.log(`\n--------- ${testName} ---------\n`);

component = new Component(devLog, errLog, true);

// component.createNode(1, {a: 123});
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

console.log(`\n--------- test ${testName} end   ---------\n`);