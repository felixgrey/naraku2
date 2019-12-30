
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
const testName = 'RunnerManager';
const Component = require(`../../lib/DataHub/${testName}.js`).default;
// ----------------------------------------------------------- //

let container = new Container();;

console.log(`\n--------- test ${testName} start ---------\n`);

let component = new Component(container,  true);

console.log(`\n--- ${testName}.destroy() ---\n`);
component.destroy();

console.log(`\n--- Container.destroy() ---\n`);

component = new Component(container, true);
container.destroy();


container = new Container();;
component = new Component(container, true);

component.run('test1');
equalAssert(component.hasRunner('test1'), false);
component.register('test1', (a, b, c) => {
	console.log('run test1', a, b, c);
	equalAssert(a, 123);
});
equalAssert(component.hasRunner('test1'), true);
component.run('test1', 123);
component.run('test1', 123, 111, 222);

component.unRegister('test1');
equalAssert(component.hasRunner('test1'), false);
component.run('test1');

component.register('test2', (a, b, c) => {
	console.log('run test2', a, b, c);
	equalAssert(a, 999);
});

component.destroy();

component.run('test2');
component.unRegister('test1');
component.hasRunner('test1')



console.log(`\n--------- test ${testName} end   ---------\n`);