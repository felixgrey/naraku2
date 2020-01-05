import {
	udFun,
} from './../Utils';

import LifeCycle from '../Common/LifeCycle';
import ErrorType from '../Common/ErrorType';

const {
	publicMethod
} = LifeCycle;

export default class Container extends LifeCycle {

	initialization() {
		this.updateLogger();

		this.data = {};
		this.runner = {};
	}

	bindUnion(instance, logName) {
		this.union.bindUnion(instance, logName);
		this.bindContainer(instance);
	}

	bindContainer(instance) {
		instance.dataHub = this;
		instance.dataHubController = this;
		instance.dataStore = this;
		instance.viewContext = this;
	};

	destruction() {
		this.runner = null;
		this.data = null;
	}

	@publicMethod
	removeData(name) {
		if (!this.data.hasOwnProperty(name)) {
			return false;
		}
		delete this.data[name];
		return true;
	}

	@publicMethod
	hasData(name) {
		return this.data.hasOwnProperty(name);
	}

	@publicMethod
	getData(name) {
		return this.data[name];
	}

	@publicMethod
	setData(name, value) {
		this.data[name] = value;
	}

	@publicMethod
	hasRunner(name) {
		return !!this.runner[name];
	}

	@publicMethod
	getRunner(name) {
		return this.runner[name];
	}

	@publicMethod
	addRunner(name, callback) {
		if (this.runner[name]) {
			return false;
		}
		this.runner[name] = callback;
		return true;
	}

	@publicMethod
	removeRunner(name) {
		if (!this.runner[name]) {
			return false;
		}
		delete this.runner[name];
		return true;
	}

	@publicMethod
	run(name, ...args) {
		if (!this.runner[name]) {
			this.methodErrLog('run', [name, ...args], ErrorType.notExist);
			return udFun;
		}
		return this.runner[name](...args);
	}

}

Container.publicMethod = publicMethod;
