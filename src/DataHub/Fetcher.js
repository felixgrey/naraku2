import {
	createUid,
	createLog,
	snapshot,
	udFun,
	sameFun,
	isNvl,
	showLog
} from './../Utils';
import PaginationManager from './PaginationManager';

let fetchMap = {};
let stopKeyMap = {};
let fetchingMap = {};

let errorLog = createLog('Fetcher', 'error', true);
let devLog = createLog('Fetcher', 'log', showLog);

let fetcher = null;

function clearStatus(name, stopKey, _callName) {
	if (!isNvl(name)) {
		fetchingMap[name] = false;
	}
	devLog('clearStatus: ' + _callName, name, stopKey, JSON.stringify(stopKeyMap));
	if (!isNvl(stopKey)) {
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

function removeFetcher(name) {
	if (fetchingMap[name]) {
		errorLog(`${name} is fetching, can't be remove .`);
		return;
	}
	delete fetchMap[name];
}

function getFetcher(name) {
	return snapshot(fetchMap[name]);
}

function initFetcher(callback) {
	fetcher = callback || udFun;
}

function stopFetchData(stopKey) {
	if (!stopKeyMap[stopKey]) {
		devLog(`stopKey ${stopKey} not existed.`);
		return;
	}

	const {
		name,
		callback
	} = stopKeyMap[stopKey];
	devLog(`stopFetchData`, name, stopKey);
	callback();
}

const NOt_INIT_FETCHER = createUid('NOt_INIT_FETCHER_');
const NOt_ADD_FETCH = createUid('NOt_ADD_FETCH_');
const FETCHING = createUid('FETCHING_');
const NO_URL = createUid('NO_URL_');

function fetchData(name, data = null, dataInfo = {}, paginationManager = null, stopKey = null) {
	if (!fetcher) {
		return Promise.reject(NOt_INIT_FETCHER);
	}

	let fetch;
	if (typeof name === 'object') {
		fetch = name;
	} else {
		fetch = fetchMap[name];
	}


	if (!fetch) {
		errorLog(`${name} not existed.`);
		return Promise.reject(NOt_ADD_FETCH);
	}

	if (fetchingMap[name]) {
		errorLog(`${name} is fetching.`);
		return Promise.reject(FETCHING);
	}

	fetchingMap[name] = true;

	const {
		url,
		method = 'get',
		extend = {},
	} = fetch;

	if (!url) {
		errorLog(`no url.`);
		return Promise.reject(NO_URL);
	}

	const _extend = Object.assign({
		dataType: 'json',
		updateHeader: sameFun,
		beforeSend: udFun,
		beforeSetResult: sameFun,
	}, snapshot(extend));

	let setResult;
	let setError;
	let onStop = udFun;

	const fetchPromise = new Promise(function(resolve, reject) {
		setResult = (data) => {
			resolve(data);
		}

		if (!isNvl(stopKey)) {
			if (stopKeyMap[stopKey]) {
				errorLog(`stopKey ${stopKey} has existed stop will be invalid.`);
			} else {

				stopKeyMap[stopKey] = {
					name,
					callback: () => {
						resolve([]);
					}
				};

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
			reject(err);
		}
	});

	let paginationInfo = null;
	let setDataCount = udFun;
	if (paginationManager instanceof PaginationManager) {
		paginationInfo = paginationManager.getPaginationInfo();
		setDataCount = paginationManager.setDataCount.bind(paginationManager);
	}

	fetcher({
		url,
		method,
		data: snapshot(data),
		dataInfo: snapshot(dataInfo),
		paginationInfo,
		setResult,
		setDataCount,
		setError,
		onStop,
		stopKey,
		extend: _extend,
	});

	return fetchPromise.finally(_ => {
		clearStatus(name, stopKey, 'finally');
	});
}

/*
 当前URL
 */
const localBaseUrl = (() => {
	let {
		protocol = '', hostname = '', port = ''
	} = global.location || {};
	return `${protocol}//${hostname}${port ? (':' + port) : ''}`;
})();

export {
	NOt_INIT_FETCHER,
	NOt_ADD_FETCH,
	FETCHING,
	NO_URL,
	localBaseUrl,
	addFetcher,
	removeFetcher,
	getFetcher,
	initFetcher,
	stopFetchData,
	fetchData,
}
