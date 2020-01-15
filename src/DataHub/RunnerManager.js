import {
  isNvl,
  udFun
} from './../Utils';

import ErrorType from '../Common/ErrorType';
import Component from './Component';

const publicMethods = [
  'hasRunner',
  'unRegister',
  'register',
  'run'
];

const {
  publicMethod
} = Component;

export default class RunnerManager extends Component {

  initialization(...args) {
    super.initialization(...args);

    this.registerRunner = {};
  }

  destruction() {
    Object.keys(this.registerRunner).forEach(method => {
      this.dataHub.removeRunner(method);
    });
    this.registerRunner = null;

    super.destruction();
  }

  @publicMethod
  hasRunner(name) {
    if (isNvl(name)) {
      return false;
    }

    return this.dataHub.hasRunner(name);
  }

  @publicMethod
  unRegister(name) {
    if (isNvl(name)) {
      return false;
    }

    if (!this.registerRunner[name]) {
      return false;
    }

    delete this.registerRunner[name];
    this.dataHub.removeRunner(name);
    return true;
  }

  @publicMethod
  register(name, callback) {
    if (isNvl(name)) {
      return false;
    }

    if (this.hasRunner(name)) {
      this.methodErrLog('register', [name], ErrorType.duplicateDeclare);
      return false;
    }

    this.registerRunner[name] = true;
    this.dataHub.addRunner(name, callback);
    return true;
  }

  @publicMethod
  run(name, ...args) {
    if (isNvl(name)) {
      return udFun;
    }

    if (!this.hasRunner(name)) {
      this.methodErrLog('run', [name, ...args], ErrorType.notExist);
      return udFun;
    }

    this.emitter.emit('$$run', {
      controller: this.dataHubController.key,
      name,
      args
    });

    this.emitter.emit(`$$run:${name}`, {
      controller: this.dataHubController.key,
      args
    });

    return this.dataHub.run(name, ...args);
  }
}

RunnerManager.publicMethods = publicMethods;
