const Utils = require('./../../lib/Utils/index.js');

const {
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./../TestTools/TestTools.js');
require('./../TestTools/Init-Fetcher0.js');

const testName = 'FetchManager';
const Container = require(`../../lib/DataHub/Container.js`).default;
const Component = require(`../../lib/DataHub/${testName}.js`).default;

console.log(`\n=============== ${testName} start ===============\n`);

let container = new Container(getUnion());
let component = new Component(container, container.union);
console.log(`\n--------------  ${testName} destroy --------------`);
component.destroy();

console.log(`\n--------------  ${testName} Container => destroy --------------`);
component = new Component(container, container.union);
container.destroy();

console.log(`\n--------------  ${testName} --------------`);

container = new Container(getUnion());
component = new Component(container, container.union);

// ----------------------------------------------------------- //

component.fetch('test.get', { requestName:'返回数据',name: '123456', dataCount: 2}).then((data) => {
	console.log(data);
});


component.fetch('test.get', { requestName:'1000毫秒',timeout: 1000,name: '123456', dataCount: 3}, {} ,(stop) => {
	console.log('设置中断回调');
	
	setTimeout(() => {
		console.log('执行中断')
		stop();
	}, 500);
	
}).then((data) => {
	console.log(data);
});

component.fetch('test.get', { requestName:'销毁',timeout: 1000,name: '123456', dataCount: 3}, {} ,(stop) => {
	console.log('中断回调');
	
	setTimeout(() => {
		console.log('销毁')
		component.destroy();
		component.fetch();
	}, 600);
	
}).then((data) => {
	console.log(data);
});



console.log(`\n=============== ${testName} end ===============\n`);