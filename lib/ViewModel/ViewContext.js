"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Tree = _interopRequireDefault(require("./Tree.js"));

var _DataHub = _interopRequireDefault(require("./../DataHub/DataHub"));

var _LifeCycle2 = _interopRequireDefault(require("./../Common/LifeCycle"));

var _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

var publicMethod = _LifeCycle2.default.publicMethod;
var ViewContext = (_class =
/*#__PURE__*/
function (_LifeCycle) {
  _inherits(ViewContext, _LifeCycle);

  function ViewContext() {
    _classCallCheck(this, ViewContext);

    return _possibleConstructorReturn(this, _getPrototypeOf(ViewContext).apply(this, arguments));
  }

  _createClass(ViewContext, [{
    key: "afterCreate",
    value: function afterCreate() {
      var dhConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this._tree = new _Tree.default(this.devLog, this.errLog, this._devMode);
      this._dh = new _DataHub.default(dhConfig, this.devLog, this.errLog, this._devMode);
      this.extendData = {};
    }
  }, {
    key: "beforeDestroy",
    value: function beforeDestroy() {
      this._tree.destroy();

      this._tree = null;

      this._dh.destroy();

      this._dh = null;
      this.extendData = null;
    }
  }, {
    key: "getController",
    value: function getController() {
      return this._dh.getController();
    }
  }, {
    key: "createNode",
    value: function createNode() {
      var _this$_tree;

      (_this$_tree = this._tree).createNode.apply(_this$_tree, arguments);
    }
  }, {
    key: "isWillRefresh",
    value: function isWillRefresh() {
      return this._dh.getController().isWillRefresh();
    }
  }, {
    key: "watch",
    value: function watch(callback) {
      this._dh.getController().watch(callback);
    }
  }, {
    key: "removeNode",
    value: function removeNode() {
      var _this$_tree2;

      (_this$_tree2 = this._tree).createNode.apply(_this$_tree2, arguments);
    }
  }, {
    key: "getRoot",
    value: function getRoot() {
      var _this$_tree3;

      return (_this$_tree3 = this._tree).getRoot.apply(_this$_tree3, arguments);
    }
  }, {
    key: "setParent",
    value: function setParent() {
      var _this$_tree4;

      (_this$_tree4 = this._tree).setParent.apply(_this$_tree4, arguments);
    }
  }]);

  return ViewContext;
}(_LifeCycle2.default), (_applyDecoratedDescriptor(_class.prototype, "getController", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getController"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "createNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "createNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "isWillRefresh", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "isWillRefresh"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "watch", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "watch"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "removeNode", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "removeNode"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getRoot", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "getRoot"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "setParent", [publicMethod], Object.getOwnPropertyDescriptor(_class.prototype, "setParent"), _class.prototype)), _class); // ViewContext.$loggerByParam = true;

exports.default = ViewContext;