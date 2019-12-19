
function getRandom() {
	return Math.random()*10e16;
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
function nvlFun() {return null;}
function eptFun() {return '';}
function sameFun(a) {return a;}

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
		return Array.from(set.values()).length === 0;
	}
	
	if (typeof value === 'object') {
		return Object.keys(value).length === 0;
	}
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

let createLog = () => udFun;
if (isDev) {
	createLog = function(name, type, flag) {
		if (isBlank(name) || !flag || typeof console[type] !== 'function') {
			return udFun;
		}
		
		return function (...args) {
			console[type](`【${name}-${type}】:`, ...args);
		}
	};
}

/*
	根据路径获取对象值
*/
function getDeepValue(data, path = '', defValue = null) {
	if (isNvl(data)) {
		return defValue;
	}
	
	if (typeof path === 'string') {
		path = path.split('.');
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
	深克隆
*/
function deepClone (data, _cloned = new Set()) {
	if (typeof data !== 'object' || isNvl(data) || _cloned.has(data)) {
		return data;
	}
	
	if (Array.isArray(data)) {
		const clonedData = [];
		_cloned.add(clonedData);
		for (let item of data) {
			clonedData.push(deepClone(item, _cloned));
		}
		return clonedData;
	}
	
	const clonedData = {};
	_cloned.add(clonedData);
	for (let key in data) {
		clonedData[key] = deepClone(data[key]);
	}
	
	return clonedData;
}

export {
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
	deepClone,
	
	createLog
}

