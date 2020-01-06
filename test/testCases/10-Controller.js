const Utils = require('./../../lib/Utils/index.js');

const {
	equalAssert,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./../TestTools/TestTools.js');
// require('./../TestTools/Init-Fetcher0.js');

const testName = 'Controller';
const Container = require(`../../lib/DataHub/Container.js`).default;
const Component = require(`../../lib/DataHub/${testName}.js`).default;
let container
let component
console.log(`\n=============== ${testName} start ===============\n`);

container = new Container({}, getUnion());
component = new Component(container, container.union);
console.log(`\n--------------  ${testName} destroy --------------`);
component.destroy();

console.log(`\n--------------  ${testName} Container => destroy --------------`);
component = new Component(container, container.union);
container.destroy();

console.log(`\n--------------  ${testName} --------------`);

container = new Container({}, getUnion());
component = new Component(container, container.union);

// ----------------------------------------------------------- //



console.log(`\n=============== ${testName} end ===============\n`);