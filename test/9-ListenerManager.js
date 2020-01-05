const Utils = require('./../lib/Utils/index.js');

const {
	equalAssert,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./TestTools.js');
// require('./Init-Fetcher0.js');

const testName = 'ListenerManager';
const DataHub = require(`../lib/DataHub/DataHub.js`).default;
const Component = require(`../lib/DataHub/${testName}.js`).default;
let container
let component
console.log(`\n=============== ${testName} start ===============\n`);

container = new DataHub(getUnion());
component = new Component(container, container.union);
console.log(`\n--------------  ${testName} destroy --------------`);
component.destroy();

console.log(`\n--------------  ${testName} DataHub => destroy --------------`);
component = new Component(container, container.union);
container.destroy();

console.log(`\n--------------  ${testName} --------------`);

container = new DataHub(getUnion());
component = new Component(container, container.union);

// ----------------------------------------------------------- //

container.getDataStore('testStore1').set([1,2,3])

component.when('testStore1', (data) => {
	console.log('when Data',data)
})


console.log(`\n=============== ${testName} end ===============\n`);