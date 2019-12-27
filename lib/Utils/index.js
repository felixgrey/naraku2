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
exports.pmsFun = pmsFun;
exports.isNvl = isNvl;
exports.isEmpty = isEmpty;
exports.isBlank = isBlank;
exports.getDeepValue = getDeepValue;
exports.snapshot = snapshot;
exports.logSwitch = logSwitch;
exports.setPreLog = setPreLog;
exports.getLogInfo = getLogInfo;
exports.toCamel = toCamel;
exports.toUnderline = toUnderline;
exports.toNameSpace = toNameSpace;
exports.NumberFormat = exports.createDestroyedErrorLog = exports.createLog = exports.uidSeed = exports.onGlobal = exports.isDev = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/*
	随机18位整数
*/
function getRandom() {
  return Math.random() * 10e18;
}
/*
	uid前缀
*/


var uidSeed = getRandom();
/*
	创建一个uid
*/

exports.uidSeed = uidSeed;

function createUid() {
  var pre = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return "".concat(pre).concat(uidSeed, "-").concat(getRandom(), "-").concat(getRandom());
}

var uniIndex = 1;
/*
	创建一个统一计序列号
*/

function getUniIndex() {
  return uniIndex++;
}
/**
	各种空函数
*/
// 返回 undefined


function udFun() {} // 返回 Promise


function pmsFun(a) {
  return Promise.resolve(a);
}

var nextPms = function nextPms() {
  return Promise.resolve();
}; // 返回用的兜底假数据；


var fake = {
  'FAKE_RETURN': true,
  'createLog': function createLog() {
    return udFun;
  },
  'then': nextPms,
  'catch': nextPms,
  'finally': nextPms
};
Object.assign(udFun, fake);
Object.assign(pmsFun, fake); // 返回 null

function nvlFun() {
  return null;
}

Object.assign(nvlFun, fake); // 返回 空字符串

function eptFun() {
  return '';
}

Object.assign(eptFun, fake); // 返回 第一个参数

function sameFun(a) {
  return a;
}

Object.assign(sameFun, fake);
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
var showLog = true;
var preLog = 'naraku-';
var _createLog = udFun;
exports.createLog = _createLog;
var logInfoArray = [];

function setPreLog() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  preLog = text;
}

function logSwitch(flag) {
  showLog = flag;
}

function getLogInfo() {
  return [].concat(logInfoArray);
}

if (isDev) {
  exports.createLog = _createLog = function createLog() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'log';

    if (typeof console[type] !== 'function') {
      showLog && console.error('【createLog-error】：console.${type} not existed');
      return udFun;
    }

    var logger = function logger() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      logInfoArray = ["\u3010".concat(preLog).concat(name, "-").concat(type, "\u3011:")].concat(args);
      logInfoArray.logType = type;
      showLog && console[type].apply(console, _toConsumableArray(logInfoArray));
    };

    logger.createLog = function () {
      var name2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '?';
      return _createLog("".concat(name, ".").concat(name2), type);
    };

    return logger;
  };
}

var dstroyedErrorLog = _createLog('AfterDstroyed', 'error');

var createDestroyedErrorLog = function createDestroyedErrorLog(clazz, key) {
  var _dErr = dstroyedErrorLog.createLog("".concat(clazz, "=").concat(key));

  return function (funName) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    _dErr("can't run '".concat(clazz, ".").concat(funName, "(").concat(args.join(','), ")' after destroyed."));
  };
};
/*
	根据路径获取对象值
*/


exports.createDestroyedErrorLog = createDestroyedErrorLog;

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
/*
	JSON数据快照
*/


function snapshot(value) {
  if (isNvl(value) || _typeof(value) !== 'object') {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}
/*
 驼峰命名
 */


function toCamel() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return (text + '').replace(/_(\w)/g, function (word, charcter, index) {
    if (index === 0) {
      return word;
    }

    return charcter.toUpperCase();
  });
}
/*
 下划线命名
 */


function toUnderline(text) {
  return (text + '').replace(/[A-Z]/g, function (charcter, index) {
    return '_' + charcter.toLowerCase();
  });
}
/*
	命名空间格式
*/


function toNameSpace(text) {
  return toUnderline(text).replace(/_/g, '.');
}
/*
  数字格式化
 */


var NumberFormat = {
  percent: function percent(number) {
    var extendParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _extendParam$fixed = extendParam.fixed,
        fixed = _extendParam$fixed === void 0 ? 2 : _extendParam$fixed,
        _extendParam$forceFix = extendParam.forceFixed,
        forceFixed = _extendParam$forceFix === void 0 ? false : _extendParam$forceFix,
        _extendParam$decimal = extendParam.decimal,
        decimal = _extendParam$decimal === void 0 ? true : _extendParam$decimal,
        _extendParam$noSymbol = extendParam.noSymbol,
        noSymbol = _extendParam$noSymbol === void 0 ? false : _extendParam$noSymbol,
        _extendParam$noZero = extendParam.noZero,
        noZero = _extendParam$noZero === void 0 ? false : _extendParam$noZero,
        _extendParam$blank = extendParam.blank,
        blank = _extendParam$blank === void 0 ? '--' : _extendParam$blank;
    var percentSymbol = noSymbol ? '' : '%';

    if (isNvl(number) || isNaN(+number)) {
      return blank;
    }

    number = new Number(number * (decimal ? 100 : 1)).toFixed(fixed);

    if (!forceFixed) {
      number = number.replace(/(\.\d*?)[0]*$/g, function (a, b) {
        return b.replace(/\.$/g, '');
      });
    }

    if (noZero) {
      number = number.replace(/^0\./g, '.');
    }

    return number + percentSymbol;
  },
  thsepar: function thsepar(number) {
    var extendParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _extendParam$fixed2 = extendParam.fixed,
        fixed = _extendParam$fixed2 === void 0 ? 2 : _extendParam$fixed2,
        _extendParam$forceFix2 = extendParam.forceFixed,
        forceFixed = _extendParam$forceFix2 === void 0 ? false : _extendParam$forceFix2,
        _extendParam$noZero2 = extendParam.noZero,
        noZero = _extendParam$noZero2 === void 0 ? false : _extendParam$noZero2,
        _extendParam$blank2 = extendParam.blank,
        blank = _extendParam$blank2 === void 0 ? '--' : _extendParam$blank2;

    if (isNvl(number) || isNaN(+number)) {
      return blank;
    }

    var number2 = parseInt(number);
    var decimal = number - number2;

    if (isNaN(number2) || isNaN(decimal)) {
      return blank;
    }

    number2 = Array.from("".concat(number2)).reverse().map(function (c, index) {
      return index % 3 === 0 ? c + ',' : c;
    }).reverse().join('').replace(/,$/g, '');

    if (decimal) {
      number2 = number2 + new Number(decimal).toFixed(fixed).replace('0.', '.');
    }

    if (!forceFixed) {
      number2 = number2.replace(/(\.\d*?)[0]*$/g, function (a, b) {
        return b.replace(/\.$/g, '');
      });
    } else {
      if (!decimal) {
        number2 = new Number(number).toFixed(fixed);
      }
    }

    if (noZero) {
      number2 = number2.replace(/^0\./g, '.');
    }

    return number2;
  }
};
exports.NumberFormat = NumberFormat;
var onGlobal = udFun;
exports.onGlobal = onGlobal;
var definedName = null;

if (isDev) {
  definedName = {};

  exports.onGlobal = onGlobal = function onGlobal(name) {
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : udFun;

    if (definedName[name] || !global) {
      return;
    }

    definedName[name] = 1;

    var _value;

    Object.defineProperty(global, name, {
      set: function set(value) {
        _value = value;
        callback(value);
      },
      get: function get() {
        return _value;
      }
    });
  };
}