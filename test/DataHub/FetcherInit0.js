const Utils = require('../../lib/Utils/index.js');
const Fetcher = require('../../lib/DataHub/Fetcher.js');

const MockServer = require('./../MockServer');

const {
	NOT_INIT_FETCHER,
	NOT_ADD_FETCH,
	FETCHING,
	addFetcher,
	getFetcher,
	initFetcher,
	stopFetchData,
	fetchData,
	setDevMode,
} = Fetcher;

addFetcher('test.get', 'url://test.get', 'get');
addFetcher('test.post', 'url://test.post', 'post');

addFetcher('test.get.extend', 'url://test.get.extend', 'get', {now: Date.now()});
addFetcher('test.post.extend', 'url://test.post.extend', 'post', {now: Date.now()});

setDevMode(true);

initFetcher((arg) => {
	const {
		url,
		method,
		data,
		dataInfo,
		setResult,
		setError,
		onStop,
		stopKey,
		extend,
	} = arg;
	
	console.log('------------------------------------------------------');
	
	console.log('fetch: dataInfo', dataInfo);
	// console.log('fetch: 扩展参数', extend);
	
	let hasStop = false;
	onStop(() => {
		console.log('fetch: 中断请求', url, data, stopKey);
		
		hasStop = true;
		if (data.hasOwnProperty('defaultResult')) {
			console.log('fetch: 返回中断默认值', data.defaultResult);
			setResult(data.defaultResult);
		}
	});
	
	data.isPagination = dataInfo.pagination
	
	let callback = function(result) {
		if (hasStop) {
			return;
		}
		console.log('------------------------------------------------------');
		console.log('fetch: 返回结果', result);
		setResult(result);
	}
	
	let errorCallback = function(err) {
		console.log('------------------------------------------------------');
		console.log('fetch: 返回错误', err);
		setError(err);
	}
	
	MockServer(url, data, method, callback, errorCallback);
	
	
});