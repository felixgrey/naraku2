
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
const testName = 'PaginationManager';
const Component = require(`../../lib/DataHub/${testName}.js`).default;
// ----------------------------------------------------------- //

let container = new Container();
container._name ='mockStore'

console.log(`\n--------- test ${testName} start ---------\n`);

let component = new Component(container,  true);

console.log(`\n--- ${testName}.destroy() ---\n`);
component.destroy();

console.log(`\n--- Container.destroy() ---\n`);

component = new Component(container, true);
container.destroy();

console.log(`\n------\n`);

container = new Container();;
container._name ='mockStore'
component = new Component(container, true);

component.init();


component.init({
	fetcher: 'test.get'
});

component.fetch();
// component.stopFetch();
component.setPageInfo();

// component.destroy();

// component.fetch();



console.log(`\n--------- test ${testName} end   ---------\n`);