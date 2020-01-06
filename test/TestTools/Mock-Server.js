module.exports = function (url, data, method, callback, errCallback) {
	
	console.log('=======================================================');
	
	console.log('MockServer: 请求url: ', url);
	console.log('MockServer: 请求数据: ', data);
	console.log('MockServer: 请求类型: ', method);
	
	let timeout = 0;
	if (data.timeout) {
		timeout = data.timeout;
		console.log('MockServer: 返回延迟: ', timeout);
	}
	
	let dataCount = 0;
	if (data.dataCount) {
		dataCount = data.dataCount;
	}
	
	let requestName = '???';
	if (data.requestName) {
		requestName = data.requestName;
	}
	
	let returnData = [];
	for (let i = 1; i <= dataCount; i++ ) {
		returnData.push({
			index: i,
			requestName: requestName + i
		});
	}
	
	let errMsg = null;
	if (data.errMsg) {
		errMsg = data.errMsg;
		console.log('MockServer: 错误信息', errMsg);
	}
	
	if (data.isPagination) {
		returnData = Date.now();
		console.log('MockServer: 作为分页请求');
	}
	
	console.log('MockServer: 返回结果: ', returnData);

	setTimeout(() => {
		if (errMsg === null) {
			// console.log('callback=', callback);
			callback && callback(returnData);
		} else {
			// console.log('errCallback=', errCallback);
			errCallback && errCallback(errMsg);
		}
	}, timeout);

}