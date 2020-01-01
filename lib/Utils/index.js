"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUid = createUid;
exports.getUniIndex = getUniIndex;
exports.sameFun = sameFun;
exports.isNvl = isNvl;
exports.isEmpty = isEmpty;
exports.isBlank = isBlank;
exports.getDeepValue = getDeepValue;
exports.snapshot = snapshot;
exports.uniStringify = uniStringify;
exports.logSwitch = logSwitch;
exports.setPreLog = setPreLog;
exports.setLogHandle = setLogHandle;
exports.setLogger = setLogger;
exports.getLogInfo = getLogInfo;
exports.toCamel = toCamel;
exports.toUnderline = toUnderline;
exports.toNameSpace = toNameSpace;
exports.NumberFormat = exports.createLog = exports.udFun = exports.uidSeed = exports.onGlobal = exports.isDev = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/*
	判断开发模式
*/
var isDev = process && process.env && process.env.NODE_ENV === 'development';
/*
	随机18位整数
*/

exports.isDev = isDev;

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
	通用兜底空函数
*/


var udFun = function udFun() {
  return udFun;
};

exports.udFun = udFun;

var nextPms = function nextPms() {
  return Promise.resolve();
};

var fake = {
  '$uniStringify': function $uniStringify() {
    return '{"$FAKE_RETURN": true}';
  },
  '$snapshot': function $snapshot() {
    return {
      $FAKE_RETURN: true
    };
  },
  'createLog': function createLog() {
    return udFun;
  },
  'emit': udFun,
  'on': udFun,
  'once': udFun,
  'then': nextPms,
  'catch': nextPms,
  'finally': nextPms,
  'destroy': udFun
};
Object.values(fake).forEach(function (item) {
  item.$FAKE_RETURN = true;
});
Object.assign(udFun, fake);
/*
	返回输入值的通用空函数
*/

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
/*
 log
*/


var logPrinter = (global || {}).console || {
  warn: udFun,
  log: udFun,
  error: udFun
};

function setLogger(v) {
  logPrinter = v;
}

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

var logHandle = udFun;

function setLogHandle(v) {
  logHandle = v;
}

if (isDev) {
  exports.createLog = _createLog = function createLog() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'log';

    if (typeof logPrinter[type] !== 'function') {
      showLog && logPrinter.error('【createLog-error】：logPrinter.${type} not existed');
      return udFun;
    }

    var logger = function logger() {
      var _logPrinter;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      logInfoArray = ["\u3010".concat(preLog).concat(name, "-").concat(type, "\u3011:")].concat(args);
      logInfoArray.logType = type;
      logHandle(logInfoArray);
      showLog && (_logPrinter = logPrinter)[type].apply(_logPrinter, _toConsumableArray(logInfoArray));
    };

    logger.createLog = function () {
      var name2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '?';
      return _createLog("".concat(name, ".").concat(name2), type);
    };

    return logger;
  };
}
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
/*
	数据快照
*/


function snapshot(value) {
  if (isNvl(value)) {
    return value;
  }

  if (typeof value.$snapshot === 'function') {
    return value.$snapshot();
  }

  if (_typeof(value) !== 'object') {
    return value;
  }

  try {
    value = JSON.parse(JSON.stringify(value));
  } catch (e) {
    showLog && console.error('【snapshot-error】：', e);
  }

  return value;
}
/*
	数据的字符串表示
*/


function uniStringify(obj) {
  if (isNvl(obj)) {
    return null;
  }

  if (typeof obj.$uniStringify === 'function') {
    return obj.$uniStringify();
  }

  if (typeof obj.toString === 'function') {
    return obj.toString();
  }

  var v = '';

  try {
    v = JSON.stringify(obj);
  } catch (e) {}

  return v;
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