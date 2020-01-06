const Utils = require('./../../lib/Utils/index.js');

const {
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./../TestTools/TestTools.js');
require('./../TestTools/Init-Fetcher0.js');

const testName = 'PaginationManager';
const Container = require(`../../lib/DataHub/Container.js`).default;
const Component = require(`../../lib/DataHub/${testName}.js`).default;

console.log(`\n=============== ${testName} start ===============\n`);

let container = new Container(getUnion());
let component = new Component(container, container.union);
console.log(`\n--------------  ${testName} destroy --------------`);
component.destroy();

console.log(`\n--------------  ${testName} Container => destroy --------------`);
component = new Component(container, container.union);
container.destroy();

console.log(`\n--------------  ${testName} --------------`);

container = new Container(getUnion());
component = new Component(container, container.union);

// ----------------------------------------------------------- //

component.init();

component.init({
	fetcher: 'test.get'
});

// component.fetch();

component.fetch({dataCount: true});

// component.getCount();

console.log(`\n=============== ${testName} end ===============\n`);