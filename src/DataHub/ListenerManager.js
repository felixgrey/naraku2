import {
  udFun,
  isNvl,
} from './../Utils';

import Component from './Component';

const publicMethods = [
  'on',
  'once',
  'when',
  'whenAll',
  'whenAny',
  'emit',
];

const {
  publicMethod
} = Component;

export default class ListenerManager extends Component {

  initialization(...args) {
    super.initialization(...args);
    this.offSet = new Set();
  }

  destruction() {
    super.destruction();

    Array.from(this.offSet.values()).forEach(fun => fun());
    this.offSet = null;
  }

  onAndOnce(name, callback, once) {
    let emitterOff = this.emitter[once ? 'once' : 'on'](name, callback);

    const off = () => {
      if (this.destroyed) {
        return;
      }

      if (!this.offSet.has(off)) {
        return;
      }

      this.offSet.delete(off);

      emitterOff();
    };
    this.offSet.add(off);

    return off;
  }

  @publicMethod
  on(name, callback) {
    return this.onAndOnce(name, callback, false);
  }

  @publicMethod
  once(name, callback) {
    return this.onAndOnce(name, callback, true);
  }

  @publicMethod
  emit(name, ...args) {
    return this.emitter.emit(name, ...args);
  }

  @publicMethod
  lagEmit(name, ...args) {
    return this.emitter.lagEmit(name, ...args);
  }

  createOff(offList) {

    let myOffList = offList;

    const off = () => {
      if (this.destroyed || !myOffList || !this.offSet || !this.offSet.has(off)) {
        return;
      }

      this.offSet.delete(off);

      myOffList.forEach(fun => fun());
      myOffList = null;
    };

    this.offSet.add(off);

    return off;
  }

  @publicMethod
  whenAny(...args) {
    const callback = args.pop();
    const names = args;

    const offList = [];

    names.forEach(name => {
      offList.push(this.when(name, (data) => {
        callback(data, name);
      }));
    });

    return this.createOff(offList);
  }

  @publicMethod
  when(...args) {
    let callback = args.pop();
    let names = args;

    if (!names.length) {
      return udFun;
    }

    let offList = [];

    const checkReady = () => {
      this.devLog(`when checkReady`);
      if (this.destroyed) {
        return;
      }

      const dataList = [];

      for (let name of names) {
        if (isNvl(name)) {
          dataList.push([]);
          continue;
        }

        this.devLog(`when `, name, this.dataHub.getDataStore(name).hasSet());

        if (!this.dataHub.getDataStore(name).hasSet()) {
          return;
        } else {
          dataList.push(this.dataHub.getDataStore(name).get());
        }
      }

      callback(...dataList);
    };

    names.forEach(name => {
      const storeName = this.dataHub.getDataStore(name).storeName;
      let off = this.emitter.on('$$data:' + storeName, checkReady);
      offList.push(off);
    });

    this.devLog(`when param : `, names);

    checkReady();

    return this.createOff(offList);
  }

  @publicMethod
  whenAll(...args) {
    let callback = args.pop();
    let names = args;

    if (!names.length) {
      return udFun;
    }

    let offList;

    const createCheckReady = (readyCallback = udFun) => {
      let readyCount = 0;

      return () => {
        readyCount++
        if (readyCount === names.length) {
          readyCallback(...names.map(name => this.dataHub.getDataStore(name).get()));
        }
      }
    };

    let watchReady = () => {
      if (this.destroyed || this.dataHub.destroyed) {
        return;
      }

      offList = [];
      let checkReady = createCheckReady((...args) => {
        callback(...args);
        watchReady();
      });

      for (let name of names) {
        let off = this.emitter.once('$$data:' + name, checkReady);
        offList.push(off);
      }
    }

    watchReady();

    if (names.filter(name => this.dataHub.getDataStore(name).hasSet()).length === names.length) {
      callback(...names.map(name => this.dataHub.getDataStore(name).get()));
    }

    return this.createOff(offList);
  }
}

ListenerManager.publicMethods = publicMethods;
