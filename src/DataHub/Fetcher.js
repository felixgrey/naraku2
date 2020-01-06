import {
  createUid,
  createLog,
  snapshot,
  udFun,
  sameFun,
  isNvl
} from '../Utils';

import {getDevMode}  from '../Common/Union.js';

const fetchMap = {}
const stopKeyMap = {}
const fetchingMap = {}

const errLog = createLog('Fetcher', 'error')
const devLog = createLog('Fetcher', 'log')

let fetcher = null

function clearStatus (name, stopKey, _callName) {
  if (!isNvl(name) && fetchingMap[name] > 0) {
    fetchingMap[name]--
  }

  getDevMode() && devLog(`clearStatus: ${_callName}`, name, stopKey, JSON.stringify(stopKeyMap))

  if (!isNvl(stopKey)) {
    stopKeyMap[stopKey] = null
  }
}

function addFetcher (name, url, method = 'get', extend = {}) {
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

function removeFetcher (name) {
  if (fetchingMap[name]) {
    errLog(`${name} is fetching, can't be remove .`)
    return
  }

  getDevMode() && devLog('removeFetcher: ', name)

  delete fetchMap[name]
}

function getFetcher (name) {
  return snapshot(fetchMap[name])
}

function initFetcher (callback, force = false) {
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

function hasInitFetcher () {
  return !!fetcher
}

function stopFetchData (stopKey) {
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
}

const NOT_INIT_FETCHER = createUid('NOT_INIT_FETCHER_')
const NOT_ADD_FETCH = createUid('NOT_ADD_FETCH_')
const FETCHING = createUid('FETCHING_')
const NO_URL = createUid('NO_URL_')
const ABORT_REQUEST = createUid('ABORT_REQUEST_')

function fetchData (name, data = null, dataInfo = {}, stopKey = null) {
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

  const _extend = {
    dataType: 'json',
    beforeSend: sameFun,
    afterResponse: sameFun,
    ...extend
  }

  const beforeFetch = _extend.beforeFetch || sameFun
  const afterFetch = _extend.afterFetch || sameFun

  delete _extend.beforeFetch
  delete _extend.afterFetch

  let setResult
  let setError
  let onStop = udFun

  fetchingMap[name] = fetchingMap[name] || 0
  fetchingMap[name]++

  const fetchPromise = new Promise((resolve, reject) => {
    setResult = (data) => {
      getDevMode() && devLog('fetch success and run setResult', data)
      resolve(afterFetch(data))
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
  })

  data = beforeFetch(data)
  dataInfo = snapshot(dataInfo)

  fetcher({
    url,
    method,
    data,
    dataInfo,
    setResult,
    setError,
    onStop,
    stopKey,
    extend: _extend
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
  参数到query
*/
function paramToQuery (url = '', param = {}) {
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
  hasInitFetcher
}
