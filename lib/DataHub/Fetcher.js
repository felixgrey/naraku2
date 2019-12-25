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
exports.localBaseUrl = exports.NO_URL = exports.FETCHING = exports.NOt_ADD_FETCH = exports.NOt_INIT_FETCHER = void 0;

var _Utils = require("./../Utils");

var _PaginationManager = _interopRequireDefault(require("./PaginationManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var fetchMap = {};
var stopKeyMap = {};
var fetchingMap = {};
var errorLog = (0, _Utils.createLog)('Fetcher', 'error', true);
var devLog = (0, _Utils.createLog)('Fetcher', 'log', _Utils.showLog);
var fetcher = null;

function clearStatus(name, stopKey, _callName) {
  if (!(0, _Utils.isNvl)(name) && fetchingMap[name] > 0) {
    fetchingMap[name]--;
  } // devLog('clearStatus: ' + _callName, name, stopKey, JSON.stringify(stopKeyMap));


  if (!(0, _Utils.isNvl)(stopKey)) {
    stopKeyMap[stopKey] = null;
  }
}

function addFetcher(name, url) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'get';
  var extend = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (fetchMap[name]) {
    errorLog("".concat(name, " existed."));
    return;
  }

  fetchMap[name] = {
    url: url,
    method: method,
    extend: extend
  };
}

function removeFetcher(name) {
  if (fetchingMap[name]) {
    errorLog("".concat(name, " is fetching, can't be remove ."));
    return;
  }

  delete fetchMap[name];
}

function getFetcher(name) {
  return (0, _Utils.snapshot)(fetchMap[name]);
}

function initFetcher(callback) {
  if (fetcher) {
    return;
  }

  fetcher = callback || _Utils.udFun;
}

function hasInitFetcher() {
  return !!fetcher;
}

function stopFetchData(stopKey) {
  if (!stopKeyMap[stopKey]) {
    // devLog(`stopKey ${stopKey} not existed.`);
    return;
  }

  var _stopKeyMap$stopKey = stopKeyMap[stopKey],
      name = _stopKeyMap$stopKey.name,
      callback = _stopKeyMap$stopKey.callback; // devLog(`stopFetchData`, name, stopKey);

  callback();
}

var NOt_INIT_FETCHER = (0, _Utils.createUid)('NOt_INIT_FETCHER_');
exports.NOt_INIT_FETCHER = NOt_INIT_FETCHER;
var NOt_ADD_FETCH = (0, _Utils.createUid)('NOt_ADD_FETCH_');
exports.NOt_ADD_FETCH = NOt_ADD_FETCH;
var FETCHING = (0, _Utils.createUid)('FETCHING_');
exports.FETCHING = FETCHING;
var NO_URL = (0, _Utils.createUid)('NO_URL_');
exports.NO_URL = NO_URL;

function fetchData(name) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var dataInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var paginationManager = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var stopKey = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

  if (!fetcher) {
    errorLog("must run 'initFetcher' first.");
    return Promise.reject(NOt_INIT_FETCHER);
  }

  var fetch;
  var url;

  if (_typeof(name) === 'object') {
    fetch = name;
    url = fetch.url;
    name = url;
  } else {
    fetch = fetchMap[name];
  }

  if (!fetch) {
    errorLog("fetch '".concat(name, "' not existed."));
    return Promise.reject(NOt_ADD_FETCH);
  }

  url = fetch.url;
  var _fetch = fetch,
      _fetch$method = _fetch.method,
      method = _fetch$method === void 0 ? 'get' : _fetch$method,
      _fetch$extend = _fetch.extend,
      extend = _fetch$extend === void 0 ? {} : _fetch$extend;

  if (!url) {
    errorLog("no url.");
    return Promise.reject(NO_URL);
  }

  var _extend = Object.assign({
    dataType: 'json',
    updateHeader: _Utils.sameFun,
    beforeSend: _Utils.udFun,
    beforeSetResult: _Utils.sameFun
  }, (0, _Utils.snapshot)(extend));

  var setResult;
  var setError;
  var onStop = _Utils.udFun;
  fetchingMap[name] = fetchingMap[name] || 0;
  fetchingMap[name]++;
  var fetchPromise = new Promise(function (resolve, reject) {
    setResult = function setResult(data) {
      resolve(data);
    };

    if (!(0, _Utils.isNvl)(stopKey)) {
      if (stopKeyMap[stopKey]) {
        errorLog("stopKey ".concat(stopKey, " has existed stop will be invalid."));
      } else {
        stopKeyMap[stopKey] = {
          name: name,
          callback: function callback() {
            resolve([]);
          }
        };

        onStop = function onStop() {
          var _callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;

          stopKeyMap[stopKey] = {
            name: name,
            callback: function callback() {
              _callback();

              resolve([]);
            }
          };
        };
      }
    }

    setError = function setError(err) {
      reject(err);
    };
  });
  var paginationInfo = null;

  if (paginationManager instanceof _PaginationManager.default) {
    paginationInfo = paginationManager.getPaginationInfo(url);
    var oldSetResult = setResult;

    if (paginationInfo.isPagination) {
      setResult = function setResult(count) {
        paginationManager.setDataCount(count);
        oldSetResult(null);
      };
    }
  }

  fetcher({
    url: url,
    method: method,
    data: (0, _Utils.snapshot)(data),
    dataInfo: (0, _Utils.snapshot)(dataInfo),
    paginationInfo: paginationInfo,
    setResult: setResult,
    setError: setError,
    onStop: onStop,
    stopKey: stopKey,
    extend: _extend
  });
  return fetchPromise.finally(function (_) {
    clearStatus(name, stopKey, 'finally');
  });
}
/*
 当前URL
 */


var localBaseUrl = function () {
  var _ref = global.location || {},
      _ref$protocol = _ref.protocol,
      protocol = _ref$protocol === void 0 ? '' : _ref$protocol,
      _ref$hostname = _ref.hostname,
      hostname = _ref$hostname === void 0 ? '' : _ref$hostname,
      _ref$port = _ref.port,
      port = _ref$port === void 0 ? '' : _ref$port;

  return "".concat(protocol, "//").concat(hostname).concat(port ? ':' + port : '');
}();
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