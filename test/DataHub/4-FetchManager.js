
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
const testName = 'FetchManager';
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


container = new Container();
component = new Component(container, true);

console.log('-------9999999999999999999999999999999999999999999999999999999999999999999999------',
component._key,component._dh._key, container._key, component._dh , container)


component.fetch('test.get', { requestName:'返回数据',name: '123456', dataCount: 2}).then((data) => {
	console.log(data);
});

component.fetch('test.get', { requestName:'1000毫秒',timeout: 1000,name: '123456', dataCount: 3}, {} ,(stop) => {
	console.log('设置中断回调');
	
	setTimeout(() => {
		console.log('执行中断')
		stop();
	}, 500);
	
}).then((data) => {
	console.log(data);
});

component.fetch('test.get', { requestName:'销毁',timeout: 1000,name: '123456', dataCount: 3}, {} ,(stop) => {
	console.log('中断回调');
	
	setTimeout(() => {
		console.log('销毁')
		component.destroy();
		component.fetch();
	}, 600);
	
}).then((data) => {
	console.log(data);
});

component.fetchStoreData();

component.fetchStoreData({
	name: 'testStore'
});
component.fetchStoreData({
	name: 'testStore'
});
component.fetchStoreData({
	name: 'testStore'
});

container._clazz = 'Mock-DataHub'
container._dataCenter = {};
container.getDataStore = function(name) {
	if (!this._dataCenter[name]) {
		this._dataCenter[name] = new DataStore(this, name, this.devLog, this.errLog, true);
	}
	return this._dataCenter[name];
}



container.getDataStore('testStore2').setConfig({
	fetcher: 'test.get',
	pagination: {
		fetcher: 'test.post',
		force: true
	}
});


component.fetchStoreData({
	name: 'testStore2',
	data: {dataCount: 3,requestName: 'storeA'}
});
component.fetchStoreData({
	name: 'testStore2',
	data: {dataCount: 3,requestName: 'storeB'}
});
component.fetchStoreData({
	name: 'testStore2',
	data: {dataCount: 3,requestName: 'storeC'}
});

component.fetchStoreData({
	name: 'testStore2',
	data: {timeout: 1000, dataCount: 3, requestName: 'storeD'}
});

setTimeout(() => {
	component.fetchStoreData({
		name: 'testStore2',
		data: {timeout: 1000, dataCount: 3, requestName: 'storeD'}
	});
}, 2000);

setTimeout(() => {
	component.stopFetch('testStore2');
}, 500);


console.log(`\n--------- test ${testName} end   ---------\n`);