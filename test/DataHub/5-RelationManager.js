
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
const testName = 'RelationManager';
const Component = require(`../../lib/DataHub/${testName}.js`).default;

const FetchManager = require('../../lib/DataHub/FetchManager.js').default;
const RunnerManager = require('../../lib/DataHub/RunnerManager.js').default;
const ListenerManager = require('../../lib/DataHub/ListenerManager.js').default;
const DataStore = require(`../../lib/DataHub/DataStore.js`).default;

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

container._clazz = 'Mock-DataHub-Controller-DataStore'
container._dataCenter = {};
container.getDataStore = function(name) {
	if (!this._dataCenter[name]) {
		this._dataCenter[name] = new DataStore(this, name, this.devLog, this.errLog, true);
	}
	return this._dataCenter[name];
}
container._fetchManager = new FetchManager(container, 40, true);
container._runnerManager = new RunnerManager(container, true);
container._listenerManager = new ListenerManager(container, true);


container.getDataStore('testStore0').setConfig([123, 456, 789]);

console.log(container.getDataStore('testStore0').get());

container.getDataStore('testStore1').setConfig({
	default: [111, 222, 333],
});
console.log(container.getDataStore('testStore1').get());

container.getDataStore('testStore2').setConfig(123456);
console.log(container.getDataStore('testStore2').get());

container.getDataStore('testStore3').setConfig({
	fetcher: 'test.get',
});

container._listenerManager.when('testStore3', (data) => {
	console.log('testStore3', data);
});

container.getDataStore('testStore4').setConfig({
	fetcher: 'test.get',
	dependence: 'dep1'
});

container.getDataStore('dep1').set({aaa: 'aaa',bbb: "bbb", dataCount: 3});

container._listenerManager.when('testStore4', (data) => {
	console.log('testStore4', data);
});




console.log(`\n--------- test ${testName} end   ---------\n`);