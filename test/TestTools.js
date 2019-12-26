var assert = require("assert");

const Utils = require('../lib/Utils/index.js');

const {
	createLog,
	udFun,
	isNvl,
	getLogInfo
} = Utils;

var equalLog = exports.equalLog = function(...args) {
	let name = null;
	for (let i = 0 ; i < args.length; i++) {
		// console.log(getLogInfo()[i + 1], args[i], i)
		assert.strictEqual(getLogInfo()[i], args[i]);
	}
	
	if (name) {
		console.log(`test-log '${name}' ok.`);
	}
	
	return function(value) {
		name = value;
	}
}

var equalAssert = exports.equalAssert = function(name, a, b) {
	if (arguments.length === 2) {
		b = a;
		a = name;
		name = null;
	}
	
	if (typeof a === 'object') {
		a = JSON.stringify(a);
	}
	
	if (typeof b === 'object') {
		b = JSON.stringify(b);
	}

	assert.strictEqual(a, b);
	
	if (name !== null) {
		console.log(`测试 '${name}' 通过!\n`);
	}
}

var createAsyncEqualAssert = exports.createAsyncEqualAssert = function(showLog = true) {
	let promise = Promise.resolve();
	
	return function(name, callback = udFun, timeout = null) {	
		promise = promise.then(() => {
			if (showLog) {
				if (!isNvl(timeout)) {
					console.log(`${timeout}毫秒后执行测试'${name}'`);
				} else {
					console.log(`执行测试'${name}'`);
				}
			}
			
			return new Promise((resolve) => {
				let next = function(a, b){
					if (!arguments.length) {
						resolve();
						return;
					}
					
					equalAssert(name, a, b);
					resolve();
				}
				
				let next2 = function( b){
					if (!arguments.length) {
						resolve();
						return;
					}
					
					equalLog(name, b);
					resolve();
				}
				
				let next3 = function(timeout) {
					if (!arguments.length) {
						resolve();
						return;
					}
					
					setTimeout(() => {
						resolve();
					}, timeout);
				}
				
				if (!timeout) {
					callback(next, next2, next3);
					return;
				}
				
				setTimeout(() => {
					callback(next, next2, next3);
				}, timeout);
			})
		});
	}
}
