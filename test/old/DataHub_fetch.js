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

console.log('Controller方法',Controller.getAllMethods());
console.log('Controller方法个数',Controller.getAllMethods().length);

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
		
		console.log('测试Fetch：加载数据', url, data);
		
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
		
		if (url === 'url://test.fetch.data.1') {
			setTimeout(() => {
				setResult([{id: 123, name: '张三'}]);
			}, 1000);
			
			return;
		}
		
		setResult();
	});
	
	addFetcher('test.fetch', 'url://test.fetch.1', 'get', {});
	addFetcher('test.deta', 'url://test.fetch.data.1', 'get', {});
	
	let devLogger = createLog('TestDataHubFetch', 'log', true);
	let errLogger = createLog('TestDataHubFetch', 'error', true);
	
	let dh1 = new DataHub({}, devLogger, errLogger);
	let dh1c1 = dh1.getController();

	let asyncEqualAssert1 = createAsyncEqualAssert();
	
	asyncEqualAssert1('执行fetch', (a,b, next3) => {
		dh1c1.fetch('test.fetch', {time: 500}).then((result) => {	
			console.log(result);
		});
		
		dh1c1.fetch('test.fetch', {time: 200}).then((result) => {
			console.log(result);
		});
		
		next3(1000);
	});
	
	asyncEqualAssert1('中断fetch', (next) => {
		
		let stop = function(doStop) {
			setTimeout(() => {
				// 请求500毫秒后中断请求
				doStop();
			}, 500);
		}
		
		dh1c1.fetch('test.fetch', {time: 1000, name: '测试中断'}, stop).then((result) => {
			console.log('中断fetch结果',result);
			next();
		});
		
	});
	
	let dh2 = new DataHub({}, devLogger, errLogger);
	let dh2c1 = dh2.getController();
	
	asyncEqualAssert1('销毁中断', (next) => {
		
		dh1c1.fetch('test.fetch', {time: 1000, name: '测试销毁中断'}).then((result) => {
			console.log('销毁中断结果',result);
			next();
		});
		
		setTimeout(() => {
			// 500毫秒后销毁控制器
			dh2c1.destroy();
		}, 500);
		
	});
	
	let dh3 = new DataHub({}, devLogger, errLogger);
	let dh3c1 = dh3.getController();
	
	asyncEqualAssert1('dh数据中断', (next) => {
		
		dh3c1.fetch('test.fetch', {time: 1000, name: '测试dh数据中断'}, 'stopDh').then((result) => {
			console.log('中断fetch结果',result);
			next();
		});
		
		setTimeout(() => {
			// 500毫秒后设置数据
			dh3c1.set('stopDh', 123);
		}, 500);
		
	});
	
	asyncEqualAssert1('dh状态中断', (next) => {
		
		dh3c1.fetch('test.fetch', {time: 1000, name: '测试dh状态中断'}, 'stopDh2').then((result) => {
			console.log('中断fetch结果', result);
			next();
		});
		
		setTimeout(() => {
			// 500毫秒后设置数据
			dh3c1.setStatus('stopDh2', 'loading');
		}, 500);
		
	});
	
	
	let dh3c2 = dh3c1.createController();
	let dh3c3 = dh3c1.createController();
	
	asyncEqualAssert1('多控制器请求中断', (next) => {
		
		dh3c1.fetch('test.fetch', {time: 1000, name: '多控制器请求中断'}).then((result) => {
			console.log('中断fetch结果', result);
			next();
		});
		
		setTimeout(() => {
			// 500毫秒后销毁另一个控制器
			dh3c3.destroy();
		}, 500);
		
	});
	
	let dh4 = new DataHub({
		test: {
			fetcher: 'test.deta',
			off: true
		}
	}, devLogger, errLogger);
	let dh4c1 = dh4.getController();
	
	
	asyncEqualAssert1('中断dh定义数据请求', (next) => {
		
		// 开始请求
		dh4c1.turnOn('test');
		
		setTimeout(() => {
			// 500毫秒后中断
			dh4c1.stopByName('test');
			next();
		}, 500);
		
		dh4c1.when('test', (data) => {
			console.log('中断dh定义数据请求结果', data);
		})
		
	});
	
	
	
	


} else {
	console.error('需要单独执行DataHub_fetch测试');
}
