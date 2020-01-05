const Utils = require('./../lib/Utils/index.js');

const {
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./TestTools.js');
// require('./Init-Fetcher0.js');

const testName = 'RunnerManager';
const Container = require(`../lib/DataHub/Container.js`).default;
const Component = require(`../lib/DataHub/${testName}.js`).default;

console.log(`\n=============== ${testName} start ===============\n`);

let container = new Container(getUnion());
let runner = new Component(container);
console.log(`\n--------------  ${testName} destroy --------------`);
runner.destroy();
equalErrLog(runner.register('testRunner1'), 'destroyed');
console.log(`\n--------------  ${testName} Container => destroy --------------`);
runner = new Component(container);
container.destroy();
equalErrLog(runner.register('testRunner1'), 'destroyed');
console.log(`\n--------------  ${testName} --------------`);

container = new Container(getUnion());
runner = new Component(container);

// ----------------------------------------------------------- //

function callback1 (a) {
	return 2*a
}

equalRunLog(runner.hasRunner('testRunner1'), false);
equalRunLog(runner.register('testRunner1', callback1), true);
equalRunLog(runner.hasRunner('testRunner1'), true);

equalErrLog(runner.register('testRunner1'), 'duplicateDeclare');

equalRunLog(runner.run('testRunner1', 2), 4);
equalRunLog(runner.run('testRunner1', 3), 6);

equalRunLog(runner.unRegister('testRunner1'), true);
equalRunLog(runner.unRegister('testRunner1'), false);
equalRunLog(runner.hasRunner('testRunner1'), false);

equalErrLog(runner.run('testRunner1', 2), 'notExist');


console.log(`\n=============== ${testName} end ===============\n`);