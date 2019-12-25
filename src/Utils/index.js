/*
	随机18位整数
*/
function getRandom() {
	return Math.random() * 10e18;
}

/*
	uid前缀
*/
const uidSeed = getRandom();

/*
	创建一个uid
*/
function createUid(pre = '') {
	return `${pre}${uidSeed}-${getRandom()}-${getRandom()}`;
}

let uniIndex = 1;
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
function udFun() {}

// 返回 null
function nvlFun() {
	return null;
}

// 返回 空字符串
function eptFun() {
	return '';
}

// 返回 第一个参数
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
const console = ((global || {}).console) || {
	warn: udFun,
	log: udFun,
	error: udFun
};
const isDev = process && process.env && process.env.NODE_ENV === 'development';
const showLog = process && process.env && process.env.SHOW_DEVLOG === 'true';
let createLog = () => udFun;
let logInfoArray = [];

function getLogInfo() {
	return [].concat(logInfoArray);
}
if (isDev) {
	createLog = function(name, type, flag) {
		// console.log('createLog', name, type, flag, isBlank(name) || !flag || typeof console[type] !== 'function');
		let logger = udFun;
		if (!isBlank(name) && flag) {
			if (typeof console[type] !== 'function') {
				console.log(`console.${type} not existed`);
			}
			// console.log('createLog udFun');
			logger = function(...args) {
				logInfoArray = [`【${name}-${type}】:`, ...args];
				logInfoArray.logType = [type];
				console[type](...logInfoArray);
			}
		}

		logger.createLog = function(name2 = '?', type2 = type, flag2 = flag) {
			return createLog(`${name}.${name2}`, type2, flag2);
		}

		return logger;
	};
}
udFun.createLog = udFun;

const errorLog = createLog('Error', 'error', true);
const dstroyedErrorLog = createLog('after-dstroyed', 'error', true);
const createDestroyedErrorLog = (clazz, key) => {
	return (funName, args = []) => {
		if (!args.length) {
			args = '[]';
		}
		dstroyedErrorLog(`can't run 【${clazz}=${key}】=>【${funName}@${args}】 after it is destroyed.`);
	}
}

/*
	根据路径获取对象值
*/
function getDeepValue(data, path = '', defValue) {
	if (isNvl(data)) {
		return defValue;
	}

	if (typeof path === 'string') {
		path = path.replace(/\[\]/g, '.').split('.');
	}

	let field = path.shift().trim();

	if (isEmpty(field)) {
		return defValue;
	}

	let value = data[field];

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
	JSON数据快照
*/
function snapshot(value) {
	if (isNvl(value) || typeof value !== 'object') {
		return value;
	}
	return JSON.parse(JSON.stringify(value));
}

/*
 驼峰命名
 */
function toCamel(text = '') {
	return (text + '').replace(/_(\w)/g, function(word, charcter, index) {
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
	return (text + '').replace(/[A-Z]/g, function(charcter, index) {
		return '_' + charcter.toLowerCase();
	});
}

/*
  数字格式化
 */
const NumberFormat = {
	percent: function(number, extendParam = {}) {
		const {
			fixed = 2,
				forceFixed = false,
				decimal = true,
				noSymbol = false,
				noZero = false,
				blank = '--'
		} = extendParam;

		const percentSymbol = noSymbol ? '' : '%'

		if (isNvl(number) || isNaN(+number)) {
			return blank;
		}

		number = new Number(number * (decimal ? 100 : 1)).toFixed(fixed);
		if (!forceFixed) {
			number = number.replace(/(\.\d*?)[0]*$/g, (a, b) => b.replace(/\.$/g, ''));
		}

		if (noZero) {
			number = number.replace(/^0\./g, '.');
		}

		return number + percentSymbol;
	},
	thsepar: function(number, extendParam = {}) {
		const {
			fixed = 2,
				forceFixed = false,
				noZero = false,
				blank = '--'
		} = extendParam;

		if (isNvl(number) || isNaN(+number)) {
			return blank;
		}

		let number2 = parseInt(number);
		let decimal = number - number2;

		if (isNaN(number2) || isNaN(decimal)) {
			return blank;
		}

		number2 = Array.from(`${number2}`)
			.reverse()
			.map((c, index) => index % 3 === 0 ? c + ',' : c)
			.reverse()
			.join('')
			.replace(/,$/g, '');

		if (decimal) {
			number2 = number2 + new Number(decimal).toFixed(fixed).replace('0.', '.');
		}

		if (!forceFixed) {
			number2 = number2.replace(/(\.\d*?)[0]*$/g, (a, b) => b.replace(/\.$/g, ''));
		} else {
			if (!decimal) {
				number2 = new Number(number).toFixed(fixed)
			}
		}

		if (noZero) {
			number2 = number2.replace(/^0\./g, '.');
		}

		return number2;
	}
};

let onGlobal = udFun;
let definedName = null;
if (isDev) {
	definedName = {};
	
	onGlobal = function(name, callback = udFun) {
		if (definedName[name] || !global) {
			return;
		}
		definedName[name] = 1;
		let _value;
		Object.defineProperty(global, name, {
			set: function(value) {
				_value = value;
				callback(value);
			},
			get: function() {
				return _value;
			}
		});
	};
}

export {
	isDev,
	showLog,
	onGlobal,

	uidSeed,
	createUid,
	getUniIndex,

	udFun,
	nvlFun,
	eptFun,
	sameFun,

	isNvl,
	isEmpty,
	isBlank,

	getDeepValue,
	snapshot,

	createLog,
	errorLog,
	createDestroyedErrorLog,
	getLogInfo,

	NumberFormat,
	toCamel,
	toUnderline
}
