const {
	addFetcher,
	initFetcher,
	hasInitFetcher
} = require('../../lib/DataHub/Fetcher.js');

const MockServer = require('./../MockServer');

initFetcher(function (arg) {
	const {
		url,
		method,
		data,
		dataInfo,
		paginationInfo,
		setResult,
		setError,
		onStop,
		stopKey,
		extend,
	} = arg;
	
	console.log('请求扩展', extend);

	onStop(function() {
		console.log('中断请求', url, data, stopKey);
	});
	
	if (paginationInfo) {
		data.isPagination = paginationInfo.isPagination;
	}
	
	MockServer(url, data, method, (result) => {
		setResult(result);
	}, (errMsg) => {
		setError(errMsg);
	});
});