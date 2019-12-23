var assert = require("assert");

const Utils = require('../../lib/Utils/index.js');

const DataHub = require('../../lib/DataHub/DataHub.js').default;

const {
	createLog,
	udFun,
	getLogInfo
} = Utils;

console.log('--------- test DataHub start ---------');

let emitterDevLogger = createLog('TestDataHub', 'log', true);
let emitterErrLogger = createLog('TestDataHub', 'error', true);

let dataHub = new DataHub({}, emitterDevLogger, emitterErrLogger);
dataHub.destroy();

const publicMethodsList = [
	'set', 'get', 'remove', 'hasData', 'setStatus', 'getStatus', 'lock', 'unLock', 'setError', 'getError',
	'first', 'getValue', 'clear',
	'when', 'whenAll', 'on', 'once', 'emit',
	'createController','destroy',
	'getSwitchStatus', 'setSwitchStatus',
	'fetchData', 'stopFetchData', 'stopFetchDataByName'
];

dataHub.getPublicFunction();

let dataHub2 = new DataHub({}, emitterDevLogger, emitterErrLogger);
let publicMethods = dataHub2.getPublicFunction();

publicMethodsList.forEach(funName => {
	assert.strictEqual(typeof publicMethods[funName], 'function');
});

let {
	set,
	get,
	first,
	getValue,
} = publicMethods;

const testData0 = Date.now();

set('testData0', testData0);
assert.strictEqual(get('testData0')[0], testData0);
assert.strictEqual(first('testData0'), testData0);

assert.strictEqual(first('testData-1', 123), 123);
assert.strictEqual(first('testData-1', null), null);
assert.strictEqual(JSON.stringify(first('testData-1')) , '{}');

set('testData1', {
	a: 'a',
	s: [{
		d: 'd',
		e: {
			f: 'f',
			h: [1, 2, 3, 4]
		}
	}, 'g']
});

assert.strictEqual(getValue('testData1.0.s.0.e.f'), 'f');
assert.strictEqual(getValue('testData1.0.s.0.e'), first('testData1').s[0].e);

assert.strictEqual(getValue('testData1.0.s.0.c', 888), 888);
let obj = {};
assert.strictEqual(getValue('testData1.0.s.0.c', obj), obj);

dataHub2.destroy();

getValue('testData1.0.s.0.e.f');

let dataHub3 = new DataHub({}, emitterDevLogger, emitterErrLogger);
publicMethods = dataHub3.getPublicFunction();

let {
	on,
	emit,
	when,
	clear,
	remove,
	whenAll,
	createController,
} = publicMethods;

const now = Date.now() 
const msg0 = now + '-msg0';
const msg1 = now + '-msg1';
const msg2 = now + '-msg2';
const msg3 = now + '-msg3';

emit('controllerEvent0', msg0);
let off0 = on('controllerEvent0', msg => {
	console.log('on.controllerEvent0', msg);
	assert.strictEqual(msg, msg0);
});
emit('controllerEvent0', msg0);
off0();
emit('controllerEvent0', msg0);

publicMethods.set('controllerData0', ['第一次', msg0]);

when('controllerData0', (data) => {
	const [times, msgA, msgB, msgC] = data;
	console.log('when.controllerData0');
	
	if (times === '第一次') {
		assert.strictEqual(msgA, msg0);
		assert.strictEqual(data.length, 2);
	}
	
	if (times === '第二次') {
		assert.strictEqual(msgA, msg1);
		assert.strictEqual(msgB, msg1);
		assert.strictEqual(data.length, 3);
	}
	
	if (times === '第三次') {
		assert.strictEqual(msgA, msg2);
		assert.strictEqual(data.length, 2);
	}
	
	if (times === '第四次') {
		assert.strictEqual(msgA, undefined);
		assert.strictEqual(data.length, 1);
	}
	
	if (times === undefined) {
		assert.strictEqual(data.length, 0);
	}
	
	if (times === '第五次') {
		assert.strictEqual(msgA, 123);
		assert.strictEqual(data.length, 2);
	}
	
	if (times === '第七次') {
		assert.strictEqual(msgA, 'asdf');
		assert.strictEqual(data.length, 2);
	}
	
});

publicMethods.set('controllerData0', ['第二次', msg1, msg1]);
publicMethods.set('controllerData0', ['第三次', msg2]);

let off1 = when(['controllerData0', 'controllerData1'], (data1, data2) => {
	console.log('when.controllerData0 + controllerData1', data1, data2);
	
	const [times, msgA, msgB, msgC] = data1;
	const [times2, msgA2, msgB2, msgC2] = data2;
	
	if (times === '第三次') {
		assert.strictEqual(times2, '第1次');
	}
	
	if (times === '第四次') {
		assert.strictEqual(times2, '第1次');
	}
	
	if (times2 === '第2次') {
		if (data1.length === 2) {
			assert.strictEqual(times, '第五次');
		} else {
			assert.strictEqual(data1.length, 0);
		}
		
	}
	
	if (times === undefined ) {
		assert.strictEqual(times2, '第2次');
	}
	
	if (times === '第六次' ) {
		assert.strictEqual(times2, '第3次');
		assert.strictEqual(msgA, 456);
	}

});

publicMethods.set('controllerData1', ['第1次']);
publicMethods.set('controllerData0', ['第四次']);
publicMethods.set('controllerData0', ['第五次', 123]);
publicMethods.set('controllerData1', ['第2次']);

clear('controllerData0');
remove('controllerData0');

publicMethods.set('controllerData1', ['第3次']);
publicMethods.set('controllerData0', ['第六次', 456]);

off1();

publicMethods.set('controllerData1', [msg0, msg3]);

publicMethods.set('data1', 1);
publicMethods.set('data2', 2);
publicMethods.set('data3', 3);

whenAll(['data1', 'data2', 'data3'] , (data1, data2, data3) => {
	console.log('whenAll', data1, data2, data3);
});

publicMethods.set('data1', 4);
publicMethods.set('data2', 5);
publicMethods.set('data3', 6);

publicMethods.set('data1', 7);
publicMethods.set('data2', 8);
publicMethods.set('data3', 9);

whenAll(['data1', 'data2', 'data3'] , (data1, data2, data3) => {
	console.log('whenAll2', data1, data2, data3);
});

publicMethods.set('data1', 17);
publicMethods.set('data2', 18);

setTimeout(() => {
	publicMethods.set('data3', 19);
}, 500);

const publicMethods2 = createController();

publicMethods2.when('testController2', (msg0) => {
	console.log('publicMethods2.when.testController2', msg0);
})

publicMethods.set('testController2', msg0);
publicMethods.set('testController2', msg1);
publicMethods2.destroy();
publicMethods.set('testController2', msg2);

// 'hasData', 'setStatus', 'getStatus', 'lock', 'unLock', setError


assert.strictEqual(publicMethods.hasData('testData000'), false);
publicMethods.set('testData000', msg0);
assert.strictEqual(publicMethods.hasData('testData000'), true);
publicMethods.clear('testData000');
assert.strictEqual(publicMethods.hasData('testData000'), true);
publicMethods.remove('testData000');
assert.strictEqual(publicMethods.hasData('testData000'), false);

publicMethods.set('testData000', 'aaa');
publicMethods.setStatus('testData000', 'aaa');

assert.strictEqual(
	getLogInfo()[1],
	`testData000 status must be one of "undefined","loading","locked","set","error", but it is "aaa"`
);

publicMethods.setStatus('testData000', 'locked');

assert.strictEqual(
	getLogInfo()[1],
	`please use "dataHub.lock" to lock "testData000".`
);

publicMethods.lock('testData000');
assert.strictEqual(publicMethods.getStatus('testData000'), 'locked');
publicMethods.unLock('testData000');
assert.strictEqual(publicMethods.getStatus('testData000'), 'set');

publicMethods.lock('testData000');
publicMethods.lock('testData000');
publicMethods.lock('testData000');

publicMethods.unLock('testData000');
assert.strictEqual(publicMethods.getStatus('testData000'), 'locked');

publicMethods.unLock('testData000');
assert.strictEqual(publicMethods.getStatus('testData000'), 'locked');

publicMethods.unLock('testData000');
assert.strictEqual(publicMethods.getStatus('testData000'), 'set');

publicMethods.lock('testData000');
publicMethods.set('testData000', 123);

assert.strictEqual(
	getLogInfo()[1],
	`can't set testData000 when it is locked`
);

publicMethods.setError('testData000', 'errorMsg123', 456);
assert.strictEqual(publicMethods.getStatus('testData000'), 'error');
assert.strictEqual(publicMethods.first('testData000'), 456);

assert.strictEqual(publicMethods.getError('testData000'), 'errorMsg123');

publicMethods.set('testData000', 789);
assert.strictEqual(publicMethods.getStatus('testData000'), 'set');
assert.strictEqual(publicMethods.getError('testData000'), null);


console.log('--------- test DataHub end ---------');
