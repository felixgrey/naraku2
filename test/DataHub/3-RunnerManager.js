const Utils = require('../../lib/Utils/index.js');

const {
	equalAssert,
	equalLog,
	createAsyncEqualAssert
} = require('./../TestTools.js');

const {
	createLog,
	udFun
} = Utils;

const MockDataHub0 = require('./Mock-DataHub0');
const MockController0 = require('./Mock-Controller0');

const RunnerManager = require('../../lib/DataHub/RunnerManager.js').default;

console.log('--------- test RunnerManager start ---------');

let emitterDevLogger = createLog('testRunnerManager', 'log', true);
let emitterErrLogger = createLog('testRunnerManager', 'error', true);

console.log('--- create ---');
let mdh = new MockDataHub0 ({}, emitterDevLogger, emitterErrLogger);
let mdc = new MockController0(mdh);
let rm = new RunnerManager(mdc, true);

// console.log('--- RunnerManager.destroy ---');
// rm.destroy();
// rm = new RunnerManager(mdc, true);

// console.log('--- Controller.destroy ---');
// mdc.destroy();
// mdc = new MockController0(mdh);
// lsnm = new RunnerManager(mdc, true);

console.log('--- hasRunner unRegister register run ---');
rm.run('test1');
equalAssert(rm.hasRunner('test1'), false);
rm.register('test1', (a, b, c) => {
	console.log('run test1', a, b, c);
	equalAssert(a, 123);
});
equalAssert(rm.hasRunner('test1'), true);
rm.run('test1', 123);
rm.run('test1', 123, 111, 222);

rm.unRegister('test1');
equalAssert(rm.hasRunner('test1'), false);
rm.run('test1');

rm.register('test2', (a, b, c) => {
	console.log('run test2', a, b, c);
	equalAssert(a, 999);
});

rm.destroy();

rm.run('test2');
rm.unRegister('test1');
rm.hasRunner('test1')

console.log('--------- test RunnerManager end ---------');