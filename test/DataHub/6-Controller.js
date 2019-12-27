const Utils = require('../../lib/Utils/index.js');

const {
	equalAssert,
	equalLog,
	createAsyncEqualAssert
} = require('./../TestTools.js');

const {
	createLog,
	udFun
} = Utils;

const MockDataHub0 = require('./Mock-DataHub0');

const Controller = require('../../lib/DataHub/Controller.js').default;

console.log('--------- test Controller start ---------');

let emitterDevLogger = createLog('TestController', 'log', true);
let emitterErrLogger = createLog('TestController', 'error', true);

let mdh = new MockDataHub0 ({}, emitterDevLogger, emitterErrLogger);

// console.log(Controller.publicMethods);

const controller = new Controller(mdh, true);

controller.watch(() => {
	console.log('updateView');
});

setTimeout(() => {
	mdh._emitter.emit('$$data');
	mdh._emitter.emit('$$data');
	mdh._emitter.emit('$$data');
	mdh._emitter.emit('$$status');
}, 200);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	console.log(210);
}, 210);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	console.log(220);
}, 220);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	console.log(230);
}, 230);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	console.log(240);
}, 240);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	console.log(600);
}, 250);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	console.log(260);
}, 260);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	console.log(270);
}, 270);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	console.log(280);
}, 280);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	mdh._emitter.emit('$$status');
	console.log(500);
}, 500);

setTimeout(() => {
	mdh._emitter.emit('$$data');
	mdh._emitter.emit('$$status');
	console.log(600);
}, 600);





console.log('--------- test Controller end ---------');