"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addFetcher = addFetcher;
exports.removeFetcher = removeFetcher;
exports.getFetcher = getFetcher;
exports.initFetcher = initFetcher;
exports.stopFetchData = stopFetchData;
exports.fetchData = fetchData;
exports.paramToQuery = paramToQuery;
exports.hasInitFetcher = hasInitFetcher;
exports.setDevMode = setDevMode;
exports.localBaseUrl = exports.ABORT_REQUEST = exports.NO_URL = exports.FETCHING = exports.NOT_ADD_FETCH = exports.NOT_INIT_FETCHER = void 0;

var _Utils = require("../Utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fetchMap = {};
var stopKeyMap = {};
var fetchingMap = {};
var errLog = (0, _Utils.createLog)('Fetcher', 'error');
var devLog = (0, _Utils.createLog)('Fetcher', 'log');
var fetcher = null;
var devMode = false;

function setDevMode(flag) {
  devMode = flag;
}

function clearStatus(name, stopKey, _callName) {
  if (!(0, _Utils.isNvl)(name) && fetchingMap[name] > 0) {
    fetchingMap[name]--;
  }

  devMode && devLog("clearStatus: ".concat(_callName), name, stopKey, JSON.stringify(stopKeyMap));

  if (!(0, _Utils.isNvl)(stopKey)) {
    stopKeyMap[stopKey] = null;
  }
}

function addFetcher(name, url) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'get';
  var extend = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (fetchMap[name]) {
    errLog("".concat(name, " existed."));
    return;
  }

  devMode && devLog('addFetcher: ', name, url, method, extend);
  fetchMap[name] = {
    url,
    method,
    extend
  };
}

function removeFetcher(name) {
  if (fetchingMap[name]) {
    errLog("".concat(name, " is fetching, can't be remove ."));
    return;
  }

  devMode && devLog('removeFetcher: ', name);
  delete fetchMap[name];
}

function getFetcher(name) {
  return (0, _Utils.snapshot)(fetchMap[name]);
}

function initFetcher(callback) {
  var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (fetcher) {
    if (!force) {
      errLog('fetcher has initialized.');
      return;
    }

    devMode && devLog('initialize fetch again.');
  }

  devMode && devLog('run initFetcher.');
  fetcher = callback || _Utils.udFun;
}

function hasInitFetcher() {
  return !!fetcher;
}

function stopFetchData(stopKey) {
  if (!stopKeyMap[stopKey]) {
    devMode && devLog("stopKey ".concat(stopKey, " not existed."));
    return;
  }

  var {
    name,
    callback
  } = stopKeyMap[stopKey];
  devMode && devLog('stopFetchData', name, stopKey);
  callback();
}

var NOT_INIT_FETCHER = (0, _Utils.createUid)('NOT_INIT_FETCHER_');
exports.NOT_INIT_FETCHER = NOT_INIT_FETCHER;
var NOT_ADD_FETCH = (0, _Utils.createUid)('NOT_ADD_FETCH_');
exports.NOT_ADD_FETCH = NOT_ADD_FETCH;
var FETCHING = (0, _Utils.createUid)('FETCHING_');
exports.FETCHING = FETCHING;
var NO_URL = (0, _Utils.createUid)('NO_URL_');
exports.NO_URL = NO_URL;
var ABORT_REQUEST = (0, _Utils.createUid)('ABORT_REQUEST_');
exports.ABORT_REQUEST = ABORT_REQUEST;

function fetchData(name) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var dataInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var stopKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  if (!fetcher) {
    errLog('must run \'initFetcher\' first.');
    return Promise.reject(NOT_INIT_FETCHER);
  }

  var fetch;
  var url;

  if (typeof name === 'object') {
    fetch = name;
    url = fetch.url;
    name = url;
  } else {
    fetch = fetchMap[name];
  }

  if (!fetch) {
    errLog("fetch '".concat(name, "' not existed."));
    return Promise.reject(NOT_ADD_FETCH);
  }

  url = fetch.url;
  var {
    method = 'get',
    extend = {}
  } = fetch;

  if (!url) {
    errLog('no url.');
    return Promise.reject(NO_URL);
  }

  var _extend = _objectSpread({
    dataType: 'json',
    beforeSend: _Utils.sameFun,
    afterResponse: _Utils.sameFun
  }, extend);

  var beforeFetch = _extend.beforeFetch || _Utils.sameFun;
  var afterFetch = _extend.afterFetch || _Utils.sameFun;
  delete _extend.beforeFetch;
  delete _extend.afterFetch;
  var setResult;
  var setError;
  var onStop = _Utils.udFun;
  fetchingMap[name] = fetchingMap[name] || 0;
  fetchingMap[name]++;
  var fetchPromise = new Promise((resolve, reject) => {
    setResult = data => {
      devMode && devLog('fetch success and run setResult', data);
      resolve(afterFetch(data));
    };

    if (!(0, _Utils.isNvl)(stopKey)) {
      if (stopKeyMap[stopKey]) {
        errLog("stopKey ".concat(stopKey, " has existed stop will be invalid."));
        stopKey = null;
      } else {
        // 如果没有执行onStop，中断时直接reject
        stopKeyMap[stopKey] = {
          name,
          callback: () => {
            devMode && devLog('stop and reject whthout onStop.');
            reject(ABORT_REQUEST);
          }
        }; // 执行onStop后，先执行回调，再reject

        onStop = function onStop() {
          var _callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

          stopKeyMap[stopKey] = {
            name,
            callback: () => {
              devMode && devLog('run onStop callback and reject.');

              _callback();

              reject(ABORT_REQUEST);
            }
          };
        };
      }
    }

    setError = err => {
      devMode && devLog('setError and reject.', err);
      reject(err);
    };
  });
  data = beforeFetch(data);
  dataInfo = (0, _Utils.snapshot)(dataInfo);
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
  });
  return fetchPromise.finally(() => {
    devMode && devLog('fetch finally.');
    clearStatus(name, stopKey, 'finally');
  });
}
/*
 当前URL
 */


var localBaseUrl = (() => {
  var {
    protocol = '',
    hostname = '',
    port = ''
  } = global.location || {};
  return "".concat(protocol, "//").concat(hostname).concat(port ? ":".concat(port) : '');
})();
/*
  参数到query
*/


exports.localBaseUrl = localBaseUrl;

function paramToQuery() {
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  url = url.split('#');
  var query = [];

  for (var q in param) {
    var v = param[q];

    if (!(0, _Utils.isNvl)(v)) {
      query.push("".concat(q, "=").concat(encodeURIComponent(v)));
    }
  }

  query = (url[0].indexOf('?') === -1 ? '?' : '&') + query.join('&') + (url.length > 1 ? '#' : '');
  url.splice(1, 0, query);
  return url.join('');
}