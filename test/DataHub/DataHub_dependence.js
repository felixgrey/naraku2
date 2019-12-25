const {
	equalAssert,
	createAsyncEqualAssert
} = require('./../TestTools.js');

const {
	createLog,
	udFun,
	getLogInfo
} = require('../../lib/Utils/index.js');

const {
	addFetcher,
	initFetcher,
	hasInitFetcher
} = require('../../lib/DataHub/Fetcher.js');

const DataHub = require('../../lib/DataHub/DataHub.js').default;

const Controller = require('../../lib/DataHub/Controller.js').default;

let fetchLogger = createLog('FetchLog', 'log', true);

if (!hasInitFetcher()) {	
	initFetcher(function (arg) {
		const {
			url,
			data,
			setResult,
			onStop,
			stopKey,
		} = arg;
		
		console.log('测试Dependence：加载数据', url, data);
		
		onStop(function() {
			console.log('中断请求', url, data);
		});
		
		if (url === 'url://test.fetch.1') {
			if (data.time) {
				setTimeout(() => {
					setResult([{lagTime: data.time, requestName: data.name}]);
				}, data.time);
				
				return;
			}
			return;
		}
		setResult();
	});
	
	addFetcher('test.fetch', 'url://test.fetch.1', 'get', {});
	
	let devLogger = createLog('TestDataHubDependence', 'log', true);
	let errLogger = createLog('TestDataHubDependence', 'error', true);
	
	let dh1 = new DataHub({
		test1: {
			fetcher: 'test.fetch',
			dependence: 'dep1',
			forceFetch: true,
		},
		test2: {
			fetcher: 'test.fetch',
			dependence: 'dep2',
		}
	}, devLogger, errLogger);
	
	let dh1c1 = dh1.getController();

	let asyncEqualAssert1 = createAsyncEqualAssert();

	asyncEqualAssert1('强制请求', (next) => {
		
		dh1c1.set('dep1', {time: 1000, name: '第一次请求'});
		dh1c1.set('dep1', {time: 1000, name: '第二次请求'});
		
		setTimeout(() => {
			dh1c1.set('dep1', {time: 1000, name: '第三次请求'});
			next();
		}, 500);
	});
	
	asyncEqualAssert1('没有强制请求', (next) => {
		
		dh1c1.set('dep2', {time: 1000, name: '第1次请求'});
		dh1c1.set('dep2', {time: 1000, name: '第2次请求'});
		
		setTimeout(() => {
			dh1c1.set('dep2', {time: 1000, name: '第3次请求'});
		}, 20);
		
		setTimeout(() => {
			dh1c1.set('dep2', {time: 1000, name: '第4次请求'});
			next();
		}, 500);
		
	});

} else {
	console.error('需要单独执行DataHub_dependence测试');
}
