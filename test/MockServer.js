module.exports = function (url, data, method, callback, errCallback) {
	
	console.log('请求url', url);
	console.log('请求数据', data);
	console.log('请求类型', method);
	
	let timeout = 0;
	if (data.timeout) {
		timeout = data.timeout;
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
	}
	
	if (data.isPagination) {
		console.log('分页请求');
		returnData = Date.now();
	}

	setTimeout(() => {
		if (errMsg === null) {
			callback && callback(returnData);
		} else {
			errCallback && errCallback(errMsg);
		}
	}, timeout);

}