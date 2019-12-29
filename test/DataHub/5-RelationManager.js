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
const MockController1 = require('./Mock-Controller1');
require('./Init-Fetcher0.js');

const RelationManager = require('../../lib/DataHub/RelationManager.js').default;

console.log('--------- test RelationManager start ---------');

let emitterDevLogger = createLog('testRelationManager', 'log', true);
let emitterErrLogger = createLog('testRelationManager', 'error', true);

let mdh = new MockDataHub1 ({}, emitterDevLogger, emitterErrLogger);
let mdc = new MockController1(mdh);

mdh.getDataStore('testStore0').setConfig([123, 456, 789]);

console.log(mdh.getDataStore('testStore0').get());

mdh.getDataStore('testStore1').setConfig({
	default: [111, 222, 333],
});
console.log(mdh.getDataStore('testStore1').get());

mdh.getDataStore('testStore2').setConfig(123456);
console.log(mdh.getDataStore('testStore2').get());

mdh.getDataStore('testStore3').setConfig({
	fetcher: 'test.get',
});

mdc._listenerManager.when('testStore3', (data) => {
	console.log('testStore3', data);
});

mdh.getDataStore('testStore4').setConfig({
	fetcher: 'test.get',
	dependence: 'dep1'
});

mdh.getDataStore('dep1').set({aaa: 'aaa',bbb: "bbb", dataCount: 3});

mdc._listenerManager.when('testStore4', (data) => {
	console.log('testStore4', data);
});

console.log('--------- test RelationManager end ---------');