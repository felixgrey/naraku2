
const {
	equalAssert,
	equalLog,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	Container,
} = require('./../TestTools.js');

const {
	createLog,
	getUniIndex,
	setPreLog,
	setLogHandle,
} =  require('../../lib/Utils/index.js');


// ----------------------------------------------------------- //
const testName = 'DataStore';
const DataStore = require(`../../lib/DataHub/${testName}.js`).default;
// ----------------------------------------------------------- //


let container =new Container();

console.log(`\n--------- test ${testName} start ---------\n`);

let component = new DataStore(container, 'testStore1', true);

console.log(`\n--- ${testName}.destroy() ---\n`);
component.destroy();

console.log(`\n--- Container.destroy() ---\n`);
component = new DataStore(container, 'testStore2', true);
container.destroy();

container = new Container();
component = new DataStore(container, 'testStore3', true);

let data = [1,2,3];

equalRunLog(component.get(), [], []);
equalRunLog(component.first(), [], {});
equalRunLog(component.first(123), [123], 123);
equalRunLog(component.set(data), [data]);
equalRunLog(component.get(), [], data);
equalRunLog(component.first(), [], 1);
equalRunLog(component.getCount(), [], 3);

data = [
	{a: 'a'},
	{b: {
			bb: ['c'],
		},
	},
]

equalRunLog(component.set(data), [data]);
equalRunLog(component.first(), [], {a: 'a'});
equalRunLog(component.getValue('1.b.bb.0'), ['1.b.bb.0'], 'c');
equalRunLog(component.getValue('1.b.bb.2', 999), ['1.b.bb.2', 999], 999);

component.remove();
equalRunLog(component.getStatus(), [], 'undefined');

equalRunLog(component.getStoreConfig(), [], {});

component.setConfig({$extend123: 123});
equalRunLog(component.getExtendConfig(), [], {$extend123: 123});

component = new DataStore(container, 'testStore4', true);

component.setConfig({
	pagination: true,
});

equalRunLog(component.getPageInfo(), [], {
	hasPagiNation: true,
	count: 0,
	page: 1,
	size: 10,
	start: 1,
});

component.lock();
equalRunLog(component.isLocked(), [], true);

component.unLock();
equalRunLog(component.isLocked(), [], false);

component.lock();
component.lock();
component.unLock();
equalRunLog(component.isLocked(), [], true);

component.unLock();
component.unLock();
equalRunLog(component.isLocked(), [], false);

equalRunLog(component.isLoading(), [], false);
component.loading();
equalRunLog(component.isLoading(), [], true);

component.loaded(987);
equalRunLog(component.isLoading(), [], false);
equalRunLog(component.get(),[], [987]);

component.loading();
equalRunLog(component.isLoading(), [], true);
component.clearLoading();
equalRunLog(component.isLoading(), [], false);

component.lock();
equalErrLog(component.loading(), [], 'locked/loading');
component.unLock();

component.loading();
equalErrLog(component.lock(), [], 'loading');

console.log(`\n--------- test ${testName} end   ---------\n`);