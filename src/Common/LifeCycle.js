import {
	getUniIndex,
	udFun,
	isNvl
} from '../Utils';

import ErrorType from './ErrorType';
import Union from './Union';

Object.keys(ErrorType).forEach(name => {
	ErrorType[name] = name;
});

udFun.destroy = udFun;

function publicMethod(prototypeOrInstance, name, descriptor = null, target = 'that') {
	let old
	if (descriptor) {
		old = prototypeOrInstance[name];
		udFun[name] = udFun;

		if (!prototypeOrInstance.$$publicMethods) {
			prototypeOrInstance.$$publicMethods = [];
		}

		prototypeOrInstance.$$publicMethods.push(name);
	} else {
		old = function(...args) {
			if (typeof this[name] !== 'function') {
				this.methodErrLog(`this.${name}`, args, ErrorType.notMethod);
				return;
			}
			return this[name](...args);
		}
	}

	const newMethod = function(...args) {
		if (this.destroyed) {
			this.destroyedErrorLog(name, args);
			return udFun;
		}

		if (!this.ready) {
			this.notReadyErrorLog(name, args);
			return udFun;
		}

		if (!this[target]) {
			this.methodErrLog(`this.${target}`, args, ErrorType.notExist);
			return udFun;
		}

		const result = old.bind(this[target])(...args);

		let logResult = result
		if (result instanceof LifeCycle) {
			logResult = `#LifeCycleInstance:${result.logName}`;
		} else if (typeof result === 'function') {
			logResult = `#function:${result.name}`;
		}

		const logArgs = args.map((arg) => {
			if (arg instanceof LifeCycle) {
				return `#LifeCycleInstance:${arg.logName}`;
			}
			if (typeof arg === 'function') {
				return `#function:${arg.name}`;
			}
			return arg;
		})

		this.devLog(`#run:${name}`, logArgs, logResult);

		return result;
	}

	if (descriptor) {
		descriptor.value = newMethod;
		return descriptor;
	}

	return newMethod;
}

export default class LifeCycle {
	constructor(...args) {

		this.that = this;
		this.key = getUniIndex();
		this.clazz = this.constructor.name;
		this.logName = `${this.clazz}=${this.key}`;
		this.destroyed = false;
		this.ready = true;

		let union = args[args.length - 1];
		if (union instanceof Union) {
			// console.log('------------------- bindUnion ', this.clazz)
			union.bindUnion(this, this.logName);
		} else {
			// console.log('------------------- new Union ', this.clazz)
			new Union().bindUnion(this, this.logName);
		}

		this.publicMethods = (publicMethods = [], target = 'that', instance = this) => {
			publicMethods.forEach((name) => {
				instance[name] = publicMethod(this, name, null, target).bind(this);
			});
		}

		this.methodErrLog = (name = '?', args = '', errType = null, msg = errType) => {
			if (this.devMode) {
				this.devLog(`#runErr:${name}`, args, ErrorType[errType])
			} else {
				this.errLog(msg);
			}
		}

		const notAbleErr = (name, args = [], errType) => {
			if (this.devMode) {
				this.devLog(`#runErr:${name}`, args, ErrorType[errType])
			} else {
				this.errLog(`can't run '${this.clazz}.${name}(${args.join(',')})' when ${type}.`)
			}
		};

		this.destroyedErrorLog = (name, args = []) => {
			notAbleErr(name, args = [], ErrorType.destroyed);
		};

		this.notReadyErrorLog = (name, args = []) => {
			notAbleErr(name, args = [], ErrorType.notReady);
		};

		if (this.initialization) {
			this.initialization(...args)
		}

		if (this.afterCreate) {
			this.afterCreate(...args)
		}

		this.devLog(`${this.logName} created.`);
	}

	updateLogger() {
		this.union = this.union.clone();

		if (this.devMode) {
			this.union.devLog = this.devLog;
		}
		this.union.errLog = this.errLog;
	}

	destroy() {
		if (this.destroyed) {
			return;
		}

		this.emitter.emit(`$$destroy:${this.clazz}`, this._key, this.name);
		this.emitter.emit(`$$destroy:${this.clazz}=${this.key}`, this.name);

		if (!isNvl(this.name)) {
			this.emitter.emit(`$$destroy:${this.clazz}@${this.name}`, this.key);
			this.emitter.emit(`$$destroy:${this.clazz}@${this.name}=${this.key}`);
		}

		if (this.beforeDestroy) {
			this.beforeDestroy();
		}

		if (this.destruction) {
			this.destruction();
		}

		this.destroyed = true;
		this.ready = false;
		this.union = null;

		this.name = null;
		this.key = null;

		this.devLog(`${this.logName} destroyed.`);
	}
}

LifeCycle.publicMethod = publicMethod;
