"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Component2 = _interopRequireDefault(require("./Component"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethods = ['on', 'once', 'when', 'whenAll', 'emit'];
var publicMethod = _Component2.default.publicMethod;
var ListenerManager = (_class =
/*#__PURE__*/
function (_Component) {
  _inherits(ListenerManager, _Component);

  function ListenerManager() {
    _classCallCheck(this, ListenerManager);

    return _possibleConstructorReturn(this, _getPrototypeOf(ListenerManager).apply(this, arguments));
  }

  _createClass(ListenerManager, [{
    key: "afterCreate",
    value: function afterCreate(dhc) {
      this._offSet = new Set();
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      Array.from(this._offSet.values()).forEach(function (fun) {
        return fun();
      });
      this._offSet = null;
    }
  }, {
    key: "_onAndOnce",
    value: function _onAndOnce(name, callback, once) {
      var _this = this;

      var _off = this._emitter[once ? 'once' : 'on'](name, callback);

      var off = function off() {
        if (!_this._offSet.has(off)) {
          return;
        }

        _this._offSet.delete(off);

        _off();
      };

      this._offSet.add(off);

      return off;
    }
  }, {
    key: "on",
    value: function on(name, callback) {
      return this._onAndOnce(name, callback, false);
    }
  }, {
    key: "once",
    value: function once(name, callback) {
      return this._onAndOnce(name, callback, true);
    }
  }, {
    key: "emit",
    value: function emit(name) {
      var _this$_emitter;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return (_this$_emitter = this._emitter).emit.apply(_this$_emitter, [name].concat(args));
    }
  }, {
    key: "when",
    value: function when() {
      var _this2 = this;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var callback = args.pop();
      var names = args;

      if (!names.length) {
        return _Utils.udFun;
      }

      var offList = [];

      var checkReady = function checkReady() {
        _this2.devLog("when checkReady");

        if (_this2._destroyed) {
          return;
        }

        var dataList = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _name = _step.value;

            if ((0, _Utils.isNvl)(_name)) {
              dataList.push([]);
              continue;
            }

            _this2.devLog("when ", _name, _this2._dh.getDataStore(_name).hasData());

            if (!_this2._dh.getDataStore(_name).hasData()) {
              return;
            } else {
              dataList.push(_this2._dh.getDataStore(_name).get());
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        callback.apply(void 0, dataList);
      };

      names.forEach(function (_name) {
        var _off = _this2._emitter.on('$$data:' + _name, checkReady);

        offList.push(_off);
      });
      this.devLog("when param : ", names);
      checkReady();

      var off = function off() {
        if (!_this2._offSet.has(off)) {
          return;
        }

        _this2._offSet.delete(off);

        offList.forEach(function (fun) {
          return fun();
        });
        offList = null;
      };

      this._offSet.add(off);

      return off;
    }
  }, {
    key: "whenAll",
    value: function whenAll() {
      var _this3 = this;

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
        return function () {
          readyCount++;

          if (readyCount === names.length) {
            readyCallback.apply(void 0, _toConsumableArray(names.map(function (_name) {
              return _this3._dh.getDataStore(_name).get();
            })));
          }
        };
      };

      var watchReady = function watchReady() {
        if (_this3._destroyed || _this3._dh._destroyed) {
          return;
        }

        offList = [];
        var checkReady = createCheckReady(function () {
          callback.apply(void 0, arguments);
          watchReady();
        });
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = names[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _name = _step2.value;

            var _off = _this3._emitter.once('$$data:' + _name, checkReady);

            offList.push(_off);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      };

      watchReady();

      if (names.filter(function (_name) {
        return _this3._dh.getDataStore(_name).hasData();
      }).length === names.length) {
        callback.apply(void 0, _toConsumableArray(names.map(function (_name) {
          return _this3._dh.getDataStore(_name).get();
        })));
      }

      var off = function off() {
        if (_this3._destroyed) {
          return;
        }

        if (!_this3._offSet.has(off)) {
          return;
        }

        _this3._offSet.delete(off);

        offList.forEach(function (off) {
          return off();
        });
        offList = null;
      };

      this._offSet.add(off);

      return off;
    }
  }]);

  return ListenerManager;
}(_Component2.default), (_applyDecoratedDescriptor(_class.prototype, "on", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "on"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "once", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "once"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "emit", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "emit"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "when", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "when"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "whenAll", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "whenAll"), _class.prototype)), _class);
exports.default = ListenerManager;
ListenerManager.publicMethods = publicMethods;