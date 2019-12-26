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

let fetchLogger = createLog('FetchLog', 'log', true);

if (!hasInitFetcher()) {
	initFetcher(function(arg) {
		const {
			url,
			data,
			setResult,
			onStop,
			stopKey,
		} = arg;

		console.log('测试Switch：加载数据', url, data);

		if (url === 'url://test.fetch.switch.1') {
			setResult();
		}

	});

	addFetcher('test.fetch.switch', 'url://test.fetch.switch.1', 'get', {});

	let devLogger = createLog('TestDataHubFetch', 'log', true);
	let errLogger = createLog('TestDataHubFetch', 'error', true);

	let dh1 = new DataHub({
		test1: {
			fetcher: 'test.fetch.switch',
			off: true
		},
		test2: {
			fetcher: 'test.fetch.switch',
		},
		test3: [123],
		test4: {
			fetcher: 'test.fetch.switch',
			off: true,
			dependence: 'dep1',
		}
	}, devLogger, errLogger);

	let dh1c1 = dh1.getController();

	equalAssert('测试关闭状态', dh1c1.getSwitchStatus('test1'), false);

	equalAssert('测试打开状态', dh1c1.getSwitchStatus('test2'), true);

	equalAssert('测试不存在的开关', dh1c1.getSwitchStatus('test3'), null);

	let asyncEqualAssert1 = createAsyncEqualAssert();


	asyncEqualAssert1('测试开关', (next) => {
		dh1c1.turnOn('test1');
		console.log('打开开关1');
		next(dh1c1.getSwitchStatus('test1'), true);
	}, 1000);

	asyncEqualAssert1('满足依赖', (next) => {
		console.log('满足依赖');
		dh1c1.set('dep1', {
			a: 1
		});
		next();
	}, 100);

	asyncEqualAssert1('测试满足依赖的开关', (next) => {
		console.log('打开开关2');
		dh1c1.turnOn('test4');
		next();
	}, 100);


} else {
	console.error('需要单独执行DataHub_switch测试');
}
