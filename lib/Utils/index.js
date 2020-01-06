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

var nextPms = () => Promise.resolve();

var fake = {
  // 数据
  $uniStringify: () => '{"$FAKE_RETURN": true}',
  $snapshot: () => ({
    $FAKE_RETURN: true
  }),
  // log
  createLog: () => udFun,
  // Promise
  then: nextPms,
  catch: nextPms,
  finally: nextPms
};
Object.values(fake).forEach(item => {
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
  return value === undefined || value === null || value === udFun;
}

function isEmpty(value) {
  return isNvl(value) || value === '';
}

function isBlank(value) {
  return isEmpty(value) || "".concat(value).trim() === '';
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
      showLog && logPrinter.error("\u3010createLog-error\u3011\uFF1AlogPrinter.".concat(type, " not existed."));
      return udFun;
    }

    var logger = function logger() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      logInfoArray = ["\u3010".concat(preLog).concat(name, "-").concat(type, "\u3011:"), ...args];
      logInfoArray.logType = type;
      logHandle(logInfoArray);
      showLog && logPrinter[type](...logInfoArray);
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

  if (typeof value !== 'object' && path.length) {
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

  if (typeof value !== 'object') {
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
  return "".concat(text).replace(/_(\w)/g, (word, charcter, index) => {
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
  return "".concat(text).replace(/[A-Z]/g, (charcter, index) => "_".concat(charcter.toLowerCase()));
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
  percent(number) {
    var extendParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var {
      fixed = 2,
      forceFixed = false,
      decimal = true,
      noSymbol = false,
      noZero = false,
      blank = '--'
    } = extendParam;
    var percentSymbol = noSymbol ? '' : '%';

    if (isNvl(number) || isNaN(+number)) {
      return blank;
    }

    number = Number(number * (decimal ? 100 : 1)).toFixed(fixed);

    if (!forceFixed) {
      number = number.replace(/(\.\d*?)[0]*$/g, (a, b) => b.replace(/\.$/g, ''));
    }

    if (noZero) {
      number = number.replace(/^0\./g, '.');
    }

    return number + percentSymbol;
  },

  thsepar(number) {
    var extendParam = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var {
      fixed = 2,
      forceFixed = false,
      noZero = false,
      blank = '--'
    } = extendParam;

    if (isNvl(number) || isNaN(+number)) {
      return blank;
    }

    var number2 = parseInt(number);
    var decimal = number - number2;

    if (isNaN(number2) || isNaN(decimal)) {
      return blank;
    }

    number2 = Array.from("".concat(number2)).reverse().map((c, index) => index % 3 === 0 ? "".concat(c, ",") : c).reverse().join('').replace(/,$/g, '');

    if (decimal) {
      number2 += Number(decimal).toFixed(fixed).replace('0.', '.');
    }

    if (!forceFixed) {
      number2 = number2.replace(/(\.\d*?)[0]*$/g, (a, b) => b.replace(/\.$/g, ''));
    } else if (!decimal) {
      number2 = Number(number).toFixed(fixed);
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
      set(value) {
        _value = value;
        callback(value);
      },

      get() {
        return _value;
      }

    });
  };
}