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
	if (!isNvl(name) && fetchingMap[name] > 0) {
		fetchingMap[name]--;
	}
	// devLog('clearStatus: ' + _callName, name, stopKey, JSON.stringify(stopKeyMap));
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
	if (fetcher) {
		return;
	}
	fetcher = callback || udFun;
}

function hasInitFetcher() {
	return !!fetcher;
}

function stopFetchData(stopKey) {
	if (!stopKeyMap[stopKey]) {
		// devLog(`stopKey ${stopKey} not existed.`);
		return;
	}

	const {
		name,
		callback
	} = stopKeyMap[stopKey];

	// devLog(`stopFetchData`, name, stopKey);

	callback();
}

const NOt_INIT_FETCHER = createUid('NOt_INIT_FETCHER_');
const NOt_ADD_FETCH = createUid('NOt_ADD_FETCH_');
const FETCHING = createUid('FETCHING_');
const NO_URL = createUid('NO_URL_');

function fetchData(name, data = null, dataInfo = {}, stopKey = null) {
	if (!fetcher) {
		errorLog(`must run 'initFetcher' first.`);
		return Promise.reject(NOt_INIT_FETCHER);
	}

	let fetch;
	let url;
	if (typeof name === 'object') {
		fetch = name;
		url = fetch.url;
		name = url;
	} else {
		fetch = fetchMap[name];
	}

	if (!fetch) {
		errorLog(`fetch '${name}' not existed.`);
		return Promise.reject(NOt_ADD_FETCH);
	}

	url = fetch.url;

	const {
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

	fetchingMap[name] = fetchingMap[name] || 0;
	fetchingMap[name]++;

	const fetchPromise = new Promise(function(resolve, reject) {
		setResult = (data) => {
			resolve(data);
		}

		if (!isNvl(stopKey)) {
			if (stopKeyMap[stopKey]) {
				errorLog(`stopKey ${stopKey} has existed stop will be invalid.`);
				stopKey = null;
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

	fetcher({
		url,
		method,
		data: snapshot(data),
		dataInfo: snapshot(dataInfo),
		setResult,
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

/*
  参数到query 
*/
function paramToQuery(url = '', param = {}) {
	url = url.split('#');
	let query = [];
	for (let q in param) {
		let v = param[q];
		if (!isNvl(v)) {
			query.push(`${q}=${encodeURIComponent(v)}`);
		}
	}
	query = (url[0].indexOf('?') === -1 ? '?' : '&') + query.join('&') + (url.length > 1 ? '#' : '');
	url.splice(1, 0, query);
	return url.join('');
}

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
	paramToQuery,
	hasInitFetcher
}
