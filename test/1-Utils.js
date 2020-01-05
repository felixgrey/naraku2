var assert = require("assert");

const Utils = require('../lib/Utils/index.js');

console.log('--------- test Utils start ---------');

const {
	isDev,
	onGlobal,
	
	uidSeed,
	createUid,
	getUniIndex,

	udFun,
	sameFun,


	isNvl,
	isEmpty,
	isBlank,

	getDeepValue,
	snapshot,

	logSwitch,
	setPreLog,
	createLog,
	getLogInfo,

	NumberFormat,
	toCamel,
	toUnderline
} = Utils;

console.log('process.env.NODE_ENV的值：', process.env.NODE_ENV);
console.log('uidSeed的值：', uidSeed);
console.log('createUid的值：', createUid());

assert.strictEqual(udFun.then() instanceof Promise, true);
assert.strictEqual(udFun.then().then() instanceof Promise, true);
assert.strictEqual(udFun.catch() instanceof Promise, true);
assert.strictEqual(udFun.finally() instanceof Promise, true);

setPreLog('testLog-');

// `【${name}-${type}】:`
let testLog = createLog('testLog' + uidSeed, 'log', true);
testLog('测试log-1', '测试log-2', '测试log-3');

assert.strictEqual(getLogInfo()[0], `【testLog-testLog${uidSeed}-log】:`);
assert.strictEqual(getLogInfo()[1], '测试log-1');
assert.strictEqual(getLogInfo()[2], '测试log-2');
assert.strictEqual(getLogInfo()[3], '测试log-3');

let errLog = createLog('testLog' + uidSeed, 'error', true);
errLog('测试err' + uidSeed);

assert.strictEqual(getLogInfo()[0], `【testLog-testLog${uidSeed}-error】:`);
assert.strictEqual(getLogInfo()[1], '测试err' + uidSeed);


let testLog2 = createLog('first', 'log', true).createLog('second').createLog().createLog('third');
testLog2('多层log');

assert.strictEqual(getLogInfo()[0], `【testLog-first.second.?.third-log】:`);
assert.strictEqual(getLogInfo()[1], '多层log');

assert.strictEqual(udFun.createLog(), udFun);

const i1 = getUniIndex();
const i2 = getUniIndex();
const i3 = getUniIndex();
assert.strictEqual(i1 + 1, i2);
assert.strictEqual(i2 + 1, i3);

const funValue = function() {};

assert.strictEqual(udFun(), udFun);
assert.strictEqual(udFun(123), udFun);
assert.strictEqual(udFun(funValue), udFun);

assert.strictEqual(sameFun(123), 123);
assert.strictEqual(sameFun('aaa'), 'aaa');
assert.strictEqual(sameFun(null), null);

assert.strictEqual(isNvl(0), false);
assert.strictEqual(isNvl(''), false);
assert.strictEqual(isNvl([]), false);

assert.strictEqual(isNvl(null), true);
assert.strictEqual(isNvl(undefined), true);
assert.strictEqual(isNvl(funValue), false);

assert.strictEqual(isEmpty(''), true);
assert.strictEqual(isEmpty(' '), false);
assert.strictEqual(isEmpty(funValue), false);

assert.strictEqual(isBlank(' '), true);
assert.strictEqual(isBlank(' s '), false);
assert.strictEqual(isBlank(funValue), false);

const objectData = {
	a: {
		ss: 'vv',
		cc: [{
				d: '123'
			},
			[{
				e: 'eee'
			}, 456, 784, 2]
		]
	},
	b: '1111'
};

assert.strictEqual(getDeepValue(null), undefined);
assert.strictEqual(getDeepValue(null, null), undefined);
assert.strictEqual(getDeepValue(null, null, null), null);
assert.strictEqual(getDeepValue(null, null, 999), 999);
assert.strictEqual(getDeepValue(null, '', 856), 856);
assert.strictEqual(getDeepValue({}, '123123', funValue), funValue);
assert.strictEqual(getDeepValue(111, '123123', undefined), undefined);
assert.strictEqual(getDeepValue('111', '1.2.3', 856), 856);

assert.strictEqual(getDeepValue(objectData, 'a'), objectData.a);
assert.strictEqual(getDeepValue(objectData, 'a.ss'), objectData.a.ss);
assert.strictEqual(getDeepValue(objectData, 'a.cc.1'), objectData.a.cc[1]);
assert.strictEqual(getDeepValue(objectData, 'a.cc.1.2'), objectData.a.cc[1][2]);
assert.strictEqual(getDeepValue(objectData, '  a .   cc  . 1  .2'), objectData.a.cc[1][2]);

assert.strictEqual(getDeepValue(objectData, 'a.cc.1.4'), undefined);
assert.strictEqual(getDeepValue(objectData, 'a.2', 'aaa'), 'aaa');

assert.strictEqual(snapshot(1), 1);
assert.strictEqual(snapshot('1'), '1');
assert.strictEqual(snapshot(funValue), funValue);

assert.strictEqual(snapshot(null), null);
assert.strictEqual(snapshot(undefined), undefined);

assert.strictEqual(snapshot(objectData).a.cc[1][2], objectData.a.cc[1][2]);
assert.strictEqual(JSON.stringify(snapshot(objectData)), JSON.stringify(objectData));

const {
	percent,
	thsepar,
} = NumberFormat;

let globalLog = createLog('onGlobal', 'log', true);

onGlobal('testGlobal', (value) => {
	globalLog(value);
});

onGlobal('testGlobal', (value) => {
	throw new Error('不应该执行的方法');
});

global.testGlobal = 'testGlobalValue_' + Date.now();
assert.strictEqual(getLogInfo()[1], global.testGlobal);

global.testGlobal = 'testGlobalValue_2_' + Date.now();
assert.strictEqual(getLogInfo()[1], global.testGlobal);

assert.strictEqual(percent(0.125), '12.5%');
assert.strictEqual(thsepar(123456789.123456), '123,456,789.12');

assert.strictEqual(toCamel('test_camel_name'), 'testCamelName');
assert.strictEqual(toCamel('_test_camel_name'), '_testCamelName');

assert.strictEqual(toUnderline('testUnderlineName'), 'test_underline_name');
assert.strictEqual(toUnderline('_testUnderlineName'), '_test_underline_name');

setPreLog('naraku-');

console.log('--------- test Utils end---------');
