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

const MockDataHub1 = require('./Mock-DataHub1');
const MockController0 = require('./Mock-Controller0');

const ListenerManager = require('../../lib/DataHub/ListenerManager.js').default;

console.log('--------- test ListenerManager start ---------');

let emitterDevLogger = createLog('testListenerManager', 'log', true);
let emitterErrLogger = createLog('testListenerManager', 'error', true);

console.log('--- create ---');
let mdh = new MockDataHub1 ({}, emitterDevLogger, emitterErrLogger);
let mdc = new MockController0(mdh);
let lsnm = new ListenerManager(mdc, true);

// console.log('--- ListenerManager.destroy---');
// lsnm.destroy();
// lsnm = new ListenerManager(mdc, true);

// console.log('--- Controller.destroy ---');
// mdc.destroy();
// mdc = new MockController0(mdh);
// lsnm = new ListenerManager(mdc, true);

console.log('--- emit once on---');

lsnm.emit('test1', 1,2,3);

lsnm.on('test1', (...args) => {
	console.log('on',args);
});

lsnm.once('test1', (...args) => {
	console.log('once',args);
});

lsnm.emit('test1', 4,5,6);
lsnm.emit('test1', 7,8,9);


console.log('--- when ---');

mdh.getDataStore('testData1').set(['a','s','d']);

lsnm.when('testData1', (data) => {
	console.log('testData1', data);
});

mdh.getDataStore('testData1').set(['f','g','h']);

lsnm.when('testData1', 'testData2', (data1, data2) => {
	console.log('testData1 + 2', data1, data2);
});

mdh.getDataStore('testData2').set(123);

console.log('--- whenAll ---');

lsnm.whenAll('testData1', 'testData2', (data1, data2) => {
	console.log('whenAll testData1 + 2', data1, data2);
});

mdh.getDataStore('testData1').set(['a','s','d']);
mdh.getDataStore('testData2').set(987);

console.log('--------- test ListenerManager end ---------');