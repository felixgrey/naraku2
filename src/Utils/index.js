function getRandom() {
	return Math.random() * 10e18;
}

const uidSeed = getRandom();

function createUid(pre = '') {
	return `${pre}${uidSeed}-${getRandom()}-${getRandom()}`;
}

let uniIndex = 1;

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

	if (typeof value === 'object') {
		return Object.keys(value).length === 0;
	}

	return false;
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
const createDstroyedErrorLog = (clazz, key) => {
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

function snapshot(value) {
	if (isNvl(value) || typeof value !== 'object') {
		return value;
	}
	return JSON.parse(JSON.stringify(value));
}

export {
	isDev,
	showLog,

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
	isEmptyCollection,

	getDeepValue,
	snapshot,

	createLog,
	errorLog,
	createDstroyedErrorLog,
	getLogInfo
}
