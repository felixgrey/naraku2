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

const DataStore = require('../../lib/DataHub/DataStore.js').default;

console.log('--------- test DataStore start ---------');

let emitterDevLogger = createLog('TestDataStore', 'log', true);
let emitterErrLogger = createLog('TestDataStore', 'error', true);

let mdh = new MockDataHub0 ({}, emitterDevLogger, emitterErrLogger);

let ds1 = new DataStore(mdh, 'test', true);

let data = [1,2,3];

ds1.set(data);

equalAssert(ds1.get(), data);

ds1.lock();
equalAssert(ds1.isLocked(), true);

ds1.set(data);

ds1.unLock();
ds1.set(data);

ds1.lock();
ds1.lock();
ds1.unLock();
equalAssert(ds1.isLocked(), true);

ds1.loading();

ds1.unLock();
ds1.loading();
ds1.loading();

ds1.loaded([4,5,6]);

equalAssert(ds1.get(), [4,5,6]);

ds1.loading();

equalAssert(ds1.isLoading(), true);

ds1.clearLoading();

equalAssert(ds1.isLoading(), false);

equalAssert(ds1.getStatus(), 'ready');

ds1.loading();

ds1.remove();

ds1.clearLoading();
ds1.remove();

ds1.set([{a:'a'},{b:{bb:['c']}}]);

equalAssert(ds1.getValue('1.b.bb.0'), 'c');

equalAssert(ds1.getValue('1.b.bb.2', 999), 999);

equalAssert(ds1.first(), {a:'a'});

ds1.remove();
equalAssert(ds1.first(), {});
equalAssert(ds1.first(444), 444);

ds1.merge0({t:9});

equalAssert(ds1.first(), {t:9});

equalAssert(ds1.getCount(), 1);

ds1.clear();

equalAssert(ds1.isEmpty(), true);


console.log('--------- test DataStore end ---------');
