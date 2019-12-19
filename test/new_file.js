const Fetcher = require('../lib/DataHub/Fetcher.js');

const {
	addFetcher,
	getFetcher,
	initFetcher,
	stopFetchData,
	fetchData,
} = Fetcher;

initFetcher(function (arg) {
	
	const {
		url,
		method,
		data,
		dataInfo,
		paginationInfo,
		setResult,
		setDataCount,
		setError,
		onStop,
		stopKey,
		extend,
	} = arg;
	
	console.log('extend', extend);
	
	// setTimeout(() => {
	// 	setResult([{bb:'bbbbbb'}]);
	// }, 50)
	
	// setTimeout(() => {
	// 	setError('出错了');
	// }, 20);
	
	onStop(function() {
		console.log('停止请求');
	})

});

addFetcher('test', 'url1234','get', {tt: 'aa'});

console.log('请求开始');
fetchData('test',{a:'aaaaa'},null,null, 123456).then(result => {
	console.log('返回数据', result)
}).catch(result => {
	console.log('返回错误', result)
});

setTimeout(() => {
	stopFetchData(123456);
}, 2000);

