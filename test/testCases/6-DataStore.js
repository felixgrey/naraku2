const Utils = require('./../../lib/Utils/index.js');

const {
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	getUnion
} = require('./../TestTools/TestTools.js');
// require('./../TestTools/Init-Fetcher0.js');

const testName = 'DataStore';
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

let data = [1,2,3];

equalRunLog(component.get(),[]);
equalRunLog(component.first(),  {});
equalRunLog(component.first(123),  123);
equalRunLog(component.set(data));
equalRunLog(component.get(),data);
equalRunLog(component.first(), 1);
equalRunLog(component.getCount(), 3);

data = [
	{a: 'a'},
	{b: {
			bb: ['c'],
		},
	},
]

equalRunLog(component.set(data));
equalRunLog(component.first(), {a: 'a'});
equalRunLog(component.getValue('1.b.bb.0'), 'c');
equalRunLog(component.getValue('1.b.bb.2', 999), 999);


component.remove();
equalRunLog(component.getStatus(), 'undefined');

equalRunLog(component.getStoreConfig(), {});

component.setConfig({$extend123: 123});
equalRunLog(component.getExtendConfig(), {$extend123: 123});



console.log(`\n=============== ${testName} end ===============\n`);