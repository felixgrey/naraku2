
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
const testName = ?;
const Component = require(`../../lib/DataHub/${testName}.js`).default;
// ----------------------------------------------------------- //

let container = new Container();

console.log(`\n--------- test ${testName} start ---------\n`);

let component = new Component(container,  true);

console.log(`\n--- ${testName}.destroy() ---\n`);
component.destroy();

console.log(`\n--- Container.destroy() ---\n`);

component = new Component(container, true);
container.destroy();


container = new Container();;
component = new Component(container, true);


console.log(`\n--------- test ${testName} end   ---------\n`);