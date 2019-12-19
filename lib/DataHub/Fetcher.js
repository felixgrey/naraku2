"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addFetcher = addFetcher;
exports.getFetcher = getFetcher;
exports.initFetcher = initFetcher;
exports.stopFetchData = stopFetchData;
exports.fetchData = fetchData;

var _Utils = require("./../Utils");

var fetchMap = {};
var stopKeyMap = {};
var fetchingMap = {};
var fetcher = _Utils.udFun;
var errorLog = (0, _Utils.createLog)('Fetcher', 'error', true);
var devLog = (0, _Utils.createLog)('Fetcher', 'log', true);

function clearStatus(name, stopKey) {
  fetchingMap[name] = false;

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

function getFetcher(name) {
  return (0, _Utils.deepClone)(_fetchMap[name]);
}

function initFetcher(callback) {
  fetcher = callback || _Utils.udFun;
}

function stopFetchData(stopKey) {
  if (!stopKeyMap[stopKey]) {
    errorLog("stopKey ".concat(stopKey, " not existed."));
    return;
  }

  var _stopKeyMap$stopKey = stopKeyMap[stopKey],
      name = _stopKeyMap$stopKey.name,
      callback = _stopKeyMap$stopKey.callback;
  clearStatus(name, stopKey);
  callback();
}

function fetchData(name) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var dataInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var paginationManager = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var stopKey = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var fetch = fetchMap[name];

  if (!fetch) {
    errorLog("".concat(name, " not existed."));
    return;
  }

  if (fetchingMap[name]) {
    errorLog("".concat(name, " is fetching."));
    return;
  }

  fetchingMap[name] = true;
  var url = fetch.url,
      method = fetch.method,
      _fetch$extend = fetch.extend,
      extend = _fetch$extend === void 0 ? {} : _fetch$extend;

  var _extend = Object.assign({
    dataType: 'json',
    updateHeader: _Utils.sameFun,
    beforeSend: _Utils.udFun,
    beforeSetResult: _Utils.sameFun
  }, (0, _Utils.deepClone)(extend));

  var setResult;
  var setError;
  var onStop = _Utils.udFun;
  var fetchPromise = new Promise(function (resolve, reject) {
    setResult = function setResult(data) {
      clearStatus(name, stopKey);
      resolve(data);
    };

    if (!(0, _Utils.isNvl)(stopKey)) {
      if (stopKeyMap[stopKey]) {
        errorLog("stopKey ".concat(stopKey, " has existed stop will be invalid."));
      } else {
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
      clearStatus(name, stopKey);
      reject(err);
    };
  });
  var paginationInfo = null;
  var setDataCount = _Utils.udFun;

  if (paginationManager) {
    paginationInfo = paginationManager.getPaginationInfo();
    setDataCount = paginationManager.setDataCount.bind(paginationManager);
  }

  fetcher({
    url: url,
    method: method,
    data: (0, _Utils.deepClone)(data),
    dataInfo: (0, _Utils.deepClone)(dataInfo),
    paginationInfo: paginationInfo,
    setResult: setResult,
    setDataCount: setDataCount,
    setError: setError,
    onStop: onStop,
    stopKey: stopKey,
    extend: _extend
  });
  return fetchPromise;
}