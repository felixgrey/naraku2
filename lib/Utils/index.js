"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUid = createUid;
exports.getUniIndex = getUniIndex;
exports.udFun = udFun;
exports.nvlFun = nvlFun;
exports.eptFun = eptFun;
exports.sameFun = sameFun;
exports.isNvl = isNvl;
exports.isEmpty = isEmpty;
exports.isBlank = isBlank;
exports.isEmptyCollection = isEmptyCollection;
exports.getDeepValue = getDeepValue;
exports.snapshot = snapshot;
exports.createLog = exports.uidSeed = exports.showLog = exports.isDev = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function getRandom() {
  return Math.random() * 10e18;
}

var uidSeed = getRandom();
exports.uidSeed = uidSeed;

function createUid() {
  var pre = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return "".concat(pre).concat(uidSeed, "-").concat(getRandom(), "-").concat(getRandom());
}

var uniIndex = 1;

function getUniIndex() {
  return uniIndex++;
}
/**
	各种空函数
*/


function udFun() {}

function nvlFun() {
  return null;
}

function eptFun() {
  return '';
}

function sameFun(a) {
  return a;
}
/*
	各种非空判断
*/


function isNvl(value) {
  return value === undefined || value === null;
}

function isEmpty(value) {
  return isNvl(value) || value === '';
}

function isBlank(value) {
  return isEmpty(value) || ('' + value).trim() === '';
}

function isEmptyCollection(value) {
  if (isNvl(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (value instanceof Set || value instanceof Map) {
    return Array.from(value.values()).length === 0;
  }

  if (_typeof(value) === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}
/*
 log
*/


var console = (global || {}).console || {
  warn: udFun,
  log: udFun,
  error: udFun
};
var isDev = process && process.env && process.env.NODE_ENV === 'development';
exports.isDev = isDev;
var showLog = process && process.env && process.env.SHOW_DEVLOG === 'true';
exports.showLog = showLog;

var _createLog = function createLog() {
  return udFun;
};

exports.createLog = _createLog;

if (isDev) {
  exports.createLog = _createLog = function createLog(name, type, flag) {
    // console.log('createLog', name, type, flag, isBlank(name) || !flag || typeof console[type] !== 'function');
    var logger = udFun;

    if (!isBlank(name) && flag) {
      if (typeof console[type] !== 'function') {
        console.log("console.".concat(type, " not existed"));
      } // console.log('createLog udFun');


      logger = function logger() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        console[type].apply(console, ["\u3010".concat(name, "-").concat(type, "\u3011:")].concat(args));
      };
    }

    logger.createLog = function () {
      var name2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '?';
      var type2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : type;
      var flag2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : flag;
      return _createLog("".concat(name, ".").concat(name2), type2, flag2);
    };

    return logger;
  };
}

udFun.createLog = udFun;
/*
	根据路径获取对象值
*/

function getDeepValue(data) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var defValue = arguments.length > 2 ? arguments[2] : undefined;

  if (isNvl(data)) {
    return defValue;
  }

  if (typeof path === 'string') {
    path = path.replace(/\[\]/g, '.').split('.');
  }

  var field = path.shift().trim();

  if (isEmpty(field)) {
    return defValue;
  }

  var value = data[field];

  if (isNvl(value)) {
    return defValue;
  }

  if (!path.length) {
    return value;
  }

  if (_typeof(value) !== 'object' && path.length) {
    return defValue;
  }

  return getDeepValue(value, path, defValue);
}

function snapshot(value) {
  if (isNvl(value) || _typeof(value) !== 'object') {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}