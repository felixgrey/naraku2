
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
const testName = 'ListenerManager';
const Component = require(`../../lib/DataHub/${testName}.js`).default;
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


component.emit('test1', 1,2,3);

component.on('test1', (...args) => {
	console.log('on',args);
});

component.once('test1', (...args) => {
	console.log('once',args);
});

component.emit('test1', 4,5,6);
component.emit('test1', 7,8,9);

container._clazz = 'Mock-DataHub'
container._dataCenter = {};
container.getDataStore = function(name) {
	if (!this._dataCenter[name]) {
		this._dataCenter[name] = new DataStore(this, name, this.devLog, this.errLog, true);
	}
	return this._dataCenter[name];
}

console.log('--- when ---');

container.getDataStore('testData1').set(['a','s','d']);

component.when('testData1', (data) => {
	console.log('testData1', data);
});

container.getDataStore('testData1').set(['f','g','h']);

component.when('testData1', 'testData2', (data1, data2) => {
	console.log('testData1 + 2', data1, data2);
});

container.getDataStore('testData2').set(123);

console.log('--- whenAll ---');

component.whenAll('testData1', 'testData2', (data1, data2) => {
	console.log('whenAll testData1 + 2', data1, data2);
});

container.getDataStore('testData1').set(['a','s','d']);
container.getDataStore('testData2').set(987);



console.log(`\n--------- test ${testName} end   ---------\n`);