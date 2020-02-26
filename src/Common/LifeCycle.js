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

function formatLog(value, trace = new Set()) {
  if (isNvl(value)) {
    return value;
  }

  if (value instanceof LifeCycle) {
    return `#LifeCycleInstance:${value.logName}`;
  }

  if (typeof value === 'function') {
    return `#function:${value.name}`;
  }

  if (typeof value === 'object') {
    if (trace.has(value)) {
      return '#cycleValue';
    }
  }

  if (Array.isArray(value)) {
    trace.add(value);
    return value.map(item => {
      return formatLog(item, trace);
    });
  }

  if (typeof value === 'object') {
    const newValue = {};
    trace.add(value);
    Object.keys(value).forEach(key => {
      newValue[key] = formatLog(value[key], trace);
    });
    return newValue;
  }

  return value;
}

function publicMethod(prototypeOrInstance, name, descriptor = null, target = 'that') {
  if (/^constructor|^initialization$|^afterCreate$|^beforeDestroy$|^destruction|^destroy$/g.test(name)) {
    throw new Error(`can't set life cycle method '${name}' as publicMethod.`);
  }

  let old;
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
    this.devMode && this.devLog(`#run:${name}`, formatLog(args), formatLog(result));

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
      throw new Error(`last argument of constructor must be a instance of Union`);
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
        this.errLog(name, args, msg);
      }
    }

    const notAbleErr = (name, args = [], errType) => {
      if (this.devMode) {
        this.devLog(`#runErr:${name}`, args, ErrorType[errType])
      } else {
        this.errLog(`can't run '${this.clazz}.${name}(${args.join(',')})' when ${ErrorType[errType]}.`)
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

    this.emitter.emit('$$destroy', this.clazz, this.key, this.name);
    this.emitter.emit(`$$destroy:${this.logName}`, this.name);

    if (this.beforeDestroy) {
      this.beforeDestroy();
    }

    if (this.destruction) {
      this.destruction();
    }

    this.destroyed = true;
    this.ready = false;
    this.union = null;

    let name = isNvl(this.name) ? '' : '@' + this.name;

    this.name = null;
    this.key = null;

    this.devLog(`${this.logName}${name} destroyed.`);
  }
}

LifeCycle.publicMethod = publicMethod;
