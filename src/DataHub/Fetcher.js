import {createLog, deepClone, udFun, sameFun, isNvl} from './../Utils';

let fetchMap = {};
let stopKeyMap = {};
let fetchingMap = {};
let fetcher = udFun;

let errorLog = createLog('Fetcher', 'error', true);
let devLog = createLog('Fetcher', 'log', true);

function clearStatus(name, stopKey) {
	fetchingMap[name] = false;
	if(!isNvl(stopKey)){
		stopKeyMap[stopKey] = null;
	}
}

function addFetcher(name, url, method = 'get', extend = {}) {
	if (fetchMap[name]) {
		errorLog(`${name} existed.`);
		return;
	}
	
	fetchMap[name] = {
		url,
		method,
		extend,
	};
}

function getFetcher(name) {
	return deepClone(_fetchMap[name]);
}

function initFetcher(callback) {
	fetcher = callback || udFun;
}

function stopFetchData(stopKey) {
	if (!stopKeyMap[stopKey]) {
		errorLog(`stopKey ${stopKey} not existed.`);
		return;
	}
	
	const {
		name,
		callback
	} = stopKeyMap[stopKey];
	
	clearStatus(name, stopKey);
	callback();
}

function fetchData(name, data = null, dataInfo = {}, paginationManager = null, stopKey = null) {
	const fetch = fetchMap[name];
	if (!fetch) {
		errorLog(`${name} not existed.`);
		return;
	}
	
	if (fetchingMap[name]) {
		errorLog(`${name} is fetching.`);
		return;
	}
	
	fetchingMap[name] = true;
	
	const {
		url,
		method,
		extend = {},
	} = fetch;
	
	const _extend = Object.assign({
		dataType: 'json',
		updateHeader: sameFun,
		beforeSend: udFun,
		beforeSetResult: sameFun,
	}, deepClone(extend));
	
	let setResult;
	let setError;
	let onStop = udFun;
	
	const fetchPromise = new Promise(function (resolve, reject) {
		setResult = (data) => {
			clearStatus(name, stopKey);
			resolve(data);
		}
		
		if (!isNvl(stopKey)) {
			if (stopKeyMap[stopKey]) {
				errorLog(`stopKey ${stopKey} has existed stop will be invalid.`);
			} else {
				onStop = (callback = udFun) => {
					stopKeyMap[stopKey] = {
						name,
						callback: () => {
							callback();
							resolve([]);
						}
					};
				}
			}
		}

		setError = (err) => {
			clearStatus(name, stopKey);
			reject(err);
		}
	});

	let paginationInfo = null;
	let setDataCount = udFun;
	if (paginationManager) {
		paginationInfo = paginationManager.getPaginationInfo();
		setDataCount = paginationManager.setDataCount.bind(paginationManager);
	}
	
	fetcher({
		url,
		method,
		data: deepClone(data),
		dataInfo: deepClone(dataInfo),
		paginationInfo,
		setResult,
		setDataCount,
		setError,
		onStop,
		stopKey,
		extend: _extend,
	});
	
	return fetchPromise;
}

export {
	addFetcher,
	getFetcher,
	initFetcher,
	stopFetchData,
	fetchData,
}