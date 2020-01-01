
const {
	equalAssert,
	equalLog,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	Container,
} = require('./../TestTools.js');
require('./Init-Fetcher0.js');

// ----------------------------------------------------------- //
const testName = 'Controller';
const Component = require(`../../lib/DataHub/${testName}.js`).default;
// ----------------------------------------------------------- //

let container = new Container();

console.log(`\n--------- test ${testName} start ---------\n`);

let component = new Component(container, true);

console.log(`\n--- ${testName}.destroy() ---\n`);
component.destroy();

console.log(`\n--- Container.destroy() ---\n`);

component = new Component(container, true);
container.destroy();


container = new Container();
container._clazz = 'Mock-DataHub'
container._dataCenter = {};
container.getDataStore = function(name) {
	if (!this._dataCenter[name]) {
		this._dataCenter[name] = new DataStore(this, name, this.devLog, this.errLog, true);
	}
	return this._dataCenter[name];
}

component = new Component(container, true);


component.watch(() => {
	console.log('updateView');
});

setTimeout(() => {
	container._emitter.emit('$$data');
	container._emitter.emit('$$data');
	container._emitter.emit('$$data');
	container._emitter.emit('$$status');
}, 200);

setTimeout(() => {
	container._emitter.emit('$$data');
	console.log(210);
}, 210);

setTimeout(() => {
	container._emitter.emit('$$data');
	console.log(220);
}, 220);

setTimeout(() => {
	container._emitter.emit('$$data');
	console.log(230);
}, 230);

setTimeout(() => {
	container._emitter.emit('$$data');
	console.log(240);
}, 240);

setTimeout(() => {
	container._emitter.emit('$$data');
	console.log(600);
}, 250);

setTimeout(() => {
	container._emitter.emit('$$data');
	console.log(260);
}, 260);

setTimeout(() => {
	container._emitter.emit('$$data');
	console.log(270);
}, 270);

setTimeout(() => {
	container._emitter.emit('$$data');
	console.log(280);
}, 280);

setTimeout(() => {
	container._emitter.emit('$$data');
	container._emitter.emit('$$status');
	console.log(500);
}, 500);

setTimeout(() => {
	container._emitter.emit('$$data');
	container._emitter.emit('$$status');
	console.log(600);
}, 600);


console.log(`\n--------- test ${testName} end   ---------\n`);