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

const {addFetcher} = require('../../lib/DataHub/Fetcher.js');

const MockDataHub1 = require('./MockDataHub1');
const MockController0 = require('./MockController0');
require('./FetcherInit0.js');

const FetchManager = require('../../lib/DataHub/FetchManager.js').default;

console.log('--------- test FetchManager start ---------');

let emitterDevLogger = createLog('testFetchManager', 'log', true);
let emitterErrLogger = createLog('testFetchManager', 'error', true);

let mdh = new MockDataHub1 ({}, emitterDevLogger, emitterErrLogger);
let mdc = new MockController0(mdh);

let fem = new FetchManager(mdc, 40, true);

// fem.fetch('test.get', { requestName:'返回数据',name: '123456', dataCount: 2}).then((data) => {
// 	console.log(data);
// });

// fem.fetch('test.get', { requestName:'1000毫秒',timeout: 1000,name: '123456', dataCount: 3}, {} ,(stop) => {
// 	console.log('设置中断回调');
	
// 	setTimeout(() => {
// 		console.log('执行中断')
// 		stop();
// 	}, 500);
	
// }).then((data) => {
// 	console.log(data);
// });

// fem.fetch('test.get', { requestName:'销毁',timeout: 1000,name: '123456', dataCount: 3}, {} ,(stop) => {
// 	console.log('中断回调');
	
// 	setTimeout(() => {
// 		console.log('销毁')
// 		fem.destroy();
// 		fem.fetch();
// 	}, 600);
	
// }).then((data) => {
// 	console.log(data);
// });

// fem.fetchStoreData();

// fem.fetchStoreData({
// 	name: 'testStore'
// });
// fem.fetchStoreData({
// 	name: 'testStore'
// });
// fem.fetchStoreData({
// 	name: 'testStore'
// });

mdh.getDataStore('testStore2').setConfig({
	fetcher: 'test.get',
});

mdh.getPaginationManager('testStore2').init({
	fetcher: 'test.post',
	force: true
});

// fem.fetchStoreData({
// 	name: 'testStore2',
// 	data: {dataCount: 3,requestName: 'storeA'}
// });
// fem.fetchStoreData({
// 	name: 'testStore2',
// 	data: {dataCount: 3,requestName: 'storeB'}
// });
// fem.fetchStoreData({
// 	name: 'testStore2',
// 	data: {dataCount: 3,requestName: 'storeC'}
// });

fem.fetchStoreData({
	name: 'testStore2',
	data: {timeout: 1000, dataCount: 3, requestName: 'storeD'}
});

setTimeout(() => {
	fem.fetchStoreData({
		name: 'testStore2',
		data: {timeout: 1000, dataCount: 3, requestName: 'storeD'}
	});
}, 2000);

// setTimeout(() => {
// 	fem.stopFetch('testStore2');
// }, 500);

console.log('--------- test FetchManager end ---------');