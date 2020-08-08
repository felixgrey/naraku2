import {
  createUid,
  createLog,
  snapshot,
  udFun,
  sameFun,
  isNvl
} from '../Utils';

import {
  getDevMode
} from '../Common/Union.js';

const fetchMap = {}
const stopKeyMap = {}
const fetchingMap = {}

const errLog = createLog('Fetcher', 'error')
const devLog = createLog('Fetcher', 'log')

let fetcher = null

function clearStatus(name, stopKey, _callName) {
  if (!isNvl(name) && fetchingMap[name] > 0) {
    fetchingMap[name]--
  }

  getDevMode() && devLog(`clearStatus: ${_callName}`, name, stopKey, JSON.stringify(stopKeyMap))

  if (!isNvl(stopKey)) {
    stopKeyMap[stopKey] = null
  }
}

function hasFetching() {
  let stopKeys = Object.values(stopKeyMap);
  for (let key of stopKeys) {
    if (!isNvl(key)) {
      return true;
    }
  }

  return false;
}

function addFetcher(name, url, method = 'get', extend = {}) {
  if (fetchMap[name]) {
    errLog(`${name} existed.`)
    return
  }

  getDevMode() && devLog('addFetcher: ', name, url, method, extend)

  fetchMap[name] = {
    url,
    method,
    extend
  }
}

function isFetching(name) {
  return !!fetchingMap[name];
}

function removeFetcher(name) {
  if (fetchingMap[name]) {
    errLog(`${name} is fetching, can't be remove .`)
    return
  }

  getDevMode() && devLog('removeFetcher: ', name)

  delete fetchMap[name]
}

function getFetcher(name) {
  return snapshot(fetchMap[name])
}

function initFetcher(callback, force = false) {
  if (fetcher) {
    if (!force) {
      errLog('fetcher has initialized.')
      return
    }

    getDevMode() && devLog('initialize fetch again.')
  }

  getDevMode() && devLog('run initFetcher.')

  fetcher = callback || udFun
}

function hasInitFetcher() {
  return !!fetcher
}

function stopFetchData(stopKey) {
  if (!stopKeyMap[stopKey]) {
    getDevMode() && devLog(`stopKey ${stopKey} not existed.`)
    return
  }

  const {
    name,
    callback
  } = stopKeyMap[stopKey]

  getDevMode() && devLog('stopFetchData', name, stopKey)

  callback()

  clearStatus(name, stopKey, 'stopFetchData');
}

const NOT_INIT_FETCHER = createUid('NOT_INIT_FETCHER_')
const NOT_ADD_FETCH = createUid('NOT_ADD_FETCH_')
const FETCHING = createUid('FETCHING_')
const NO_URL = createUid('NO_URL_')
const ABORT_REQUEST = createUid('ABORT_REQUEST_')

function fetchData(name, data = null, dataInfo = {}, stopKey = null, extendOnce = {}) {
  if (!fetcher) {
    errLog('must run \'initFetcher\' first.')
    return Promise.reject(NOT_INIT_FETCHER)
  }

  let fetch
  let url
  if (typeof name === 'object') {
    fetch = name
    url = fetch.url
    name = url
  } else {
    fetch = fetchMap[name]
  }

  if (!fetch) {
    errLog(`fetch '${name}' not existed.`)
    return Promise.reject(NOT_ADD_FETCH)
  }

  url = fetch.url

  const {
    method = 'get',
      extend = {}
  } = fetch

  if (!url) {
    errLog('no url.')
    return Promise.reject(NO_URL)
  }

  const extend2 = {
    dataType: 'json',
    beforeRequest: sameFun,
    afterResponse: sameFun,
    extendUrl: '',
    ...extend,
    ...extendOnce
  }

  const beforeFetch = extend2.beforeFetch || sameFun
  const beforeResult = extend2.beforeResult || sameFun

  delete extend2.beforeFetch;
  delete extend2.beforeResult;

  let setResult
  let setError
  let onStop = udFun

  fetchingMap[name] = fetchingMap[name] || 0
  fetchingMap[name]++

  const fetchPromise = new Promise((resolve, reject) => {
    setResult = (data) => {
      getDevMode() && devLog('fetch success and run setResult', data)
      resolve(beforeResult(data))
    }

    if (!isNvl(stopKey)) {
      if (stopKeyMap[stopKey]) {
        errLog(`stopKey ${stopKey} has existed stop will be invalid.`)
        stopKey = null
      } else {
        // 如果没有执行onStop，中断时直接reject
        stopKeyMap[stopKey] = {
          name,
          callback: () => {
            getDevMode() && devLog('stop and reject whthout onStop.')
            reject(ABORT_REQUEST)
          }
        }

        // 执行onStop后，先执行回调，再reject
        onStop = (callback = udFun) => {
          stopKeyMap[stopKey] = {
            name,
            callback: () => {
              getDevMode() && devLog('run onStop callback and reject.')
              callback()
              reject(ABORT_REQUEST)
            }
          }
        }
      }
    }

    setError = (err) => {
      getDevMode() && devLog('setError and reject.', err)
      reject(err)
    }
  });


  let {
    extendUrl = null
  } = dataInfo;

  if (extendUrl !== null) {
    dataInfo.originUrl = url;
    if (typeof extendUrl === 'function') {
      url = url + extendUrl(data, url);
    } else if (typeof extendUrl === 'object') {
      const {
        type = 'query',
          param = {},
          format = null,
      } = extendUrl;

      if (extendUrl.hasOwnProperty('query') && !isNvl(typeof extendUrl.query) && typeof extendUrl.query === 'object') {
        url = url + paramToQuery(url, extendUrl.query);
      } else if (type === 'query') {
        url = url + paramToQuery(url, param);
      } else if (type === 'rust') {
        if (isNvl(format)) {
          errLog('extendUrl: format of rust could not be null or undefined');
        } else {
          url = url + paramToRust(url, param, format);
        }
      }
    } else {
      errLog('unknown extendUrl', extendUrl)
    }
  }

  data = beforeFetch(data);
  dataInfo = snapshot(dataInfo);

  fetcher({
    url,
    method,
    data,
    dataInfo,
    setResult,
    setError,
    onStop,
    stopKey,
    extend: extend2
  })

  return fetchPromise.finally(() => {
    getDevMode() && devLog('fetch finally.')
    clearStatus(name, stopKey, 'finally')
  })
}

/*
 当前URL
 */
const localBaseUrl = (() => {
  const {
    protocol = '', hostname = '', port = ''
  } = global.location || {}
  return `${protocol}//${hostname}${port ? (`:${port}`) : ''}`
})()

/*
  参数到rust
*/
function paramToRust(url = '', param = {}, format = '') {
  url = url.split('#')
  let query = [];
  let rust = format.split('/');
  for (const q of rust) {
    const v = param[q];
    if (!isNvl(v)) {
      query.push(v)
    } else {
      errLog(`rust param ${q} could not be null or undefined`);
      return '';
    }
  }

  query = query.join('/') + (url.length > 1 ? '#' : '')
  url.splice(1, 0, query)
  return url.join('')
}

/*
  参数到query
*/
function paramToQuery(url = '', param = {}) {
  url = url.split('#')
  let query = []
  for (const q in param) {
    const v = param[q]
    if (!isNvl(v)) {
      query.push(`${q}=${encodeURIComponent(v)}`)
    }
  }
  query = (url[0].indexOf('?') === -1 ? '?' : '&') + query.join('&') + (url.length > 1 ? '#' : '')
  url.splice(1, 0, query)
  return url.join('')
}

export {
  NOT_INIT_FETCHER,
  NOT_ADD_FETCH,
  FETCHING,
  NO_URL,
  ABORT_REQUEST,
  localBaseUrl,
  addFetcher,
  removeFetcher,
  getFetcher,
  initFetcher,
  stopFetchData,
  fetchData,
  paramToQuery,
  paramToRust,
  hasInitFetcher,
  hasFetching,
  isFetching
}
