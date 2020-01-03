"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Component = _interopRequireDefault(require("./Component"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethods = ['on', 'once', 'when', 'whenAll', 'emit'];
var {
  publicMethod
} = _Component.default;
var ListenerManager = (_class = class ListenerManager extends _Component.default {
  afterCreate(dhc) {
    this._offSet = new Set();
  }

  beforeDestroy() {
    Array.from(this._offSet.values()).forEach(fun => fun());
    this._offSet = null;
  }

  _onAndOnce(name, callback, once) {
    var _off = this._emitter[once ? 'once' : 'on'](name, callback);

    var off = () => {
      if (!this._offSet.has(off)) {
        return;
      }

      this._offSet.delete(off);

      _off();
    };

    this._offSet.add(off);

    return off;
  }

  on(name, callback) {
    return this._onAndOnce(name, callback, false);
  }

  once(name, callback) {
    return this._onAndOnce(name, callback, true);
  }

  emit(name) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return this._emitter.emit(name, ...args);
  }

  when() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var callback = args.pop();
    var names = args;

    if (!names.length) {
      return _Utils.udFun;
    }

    var offList = [];

    var checkReady = () => {
      this.devLog("when checkReady");

      if (this._destroyed) {
        return;
      }

      var dataList = [];

      for (var _name of names) {
        if ((0, _Utils.isNvl)(_name)) {
          dataList.push([]);
          continue;
        }

        this.devLog("when ", _name, this._dh.getDataStore(_name).hasData());

        if (!this._dh.getDataStore(_name).hasData()) {
          return;
        } else {
          dataList.push(this._dh.getDataStore(_name).get());
        }
      }

      callback(...dataList);
    };

    names.forEach(_name => {
      var _off = this._emitter.on('$$data:' + _name, checkReady);

      offList.push(_off);
    });
    this.devLog("when param : ", names);
    checkReady();

    var off = () => {
      if (!this._offSet.has(off)) {
        return;
      }

      this._offSet.delete(off);

      offList.forEach(fun => fun());
      offList = null;
    };

    this._offSet.add(off);

    return off;
  }

  whenAll() {
    var _this = this;

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var callback = args.pop();
    var names = args;

    if (!names.length) {
      return _Utils.udFun;
    }

    var offList;

    var createCheckReady = function createCheckReady() {
      var readyCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Utils.udFun;
      var readyCount = 0;
      return () => {
        readyCount++;

        if (readyCount === names.length) {
          readyCallback(...names.map(_name => _this._dh.getDataStore(_name).get()));
        }
      };
    };

    var watchReady = () => {
      if (this._destroyed || this._dh._destroyed) {
        return;
      }

      offList = [];
      var checkReady = createCheckReady(function () {
        callback(...arguments);
        watchReady();
      });

      for (var _name of names) {
        var _off = this._emitter.once('$$data:' + _name, checkReady);

        offList.push(_off);
      }
    };

    watchReady();

    if (names.filter(_name => this._dh.getDataStore(_name).hasData()).length === names.length) {
      callback(...names.map(_name => this._dh.getDataStore(_name).get()));
    }

    var off = () => {
      if (this._destroyed) {
        return;
      }

      if (!this._offSet.has(off)) {
        return;
      }

      this._offSet.delete(off);

      offList.forEach(off => off());
      offList = null;
    };

    this._offSet.add(off);

    return off;
  }

}, (_applyDecoratedDescriptor(_class.prototype, "on", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "on"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "once", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "once"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "emit", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "emit"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "when", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "when"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "whenAll", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "whenAll"), _class.prototype)), _class);
exports.default = ListenerManager;
ListenerManager.publicMethods = publicMethods;