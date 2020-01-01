"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("./../Utils");

var _Tree = _interopRequireDefault(require("./Tree.js"));

var _DataHub = _interopRequireDefault(require("./../DataHub/DataHub"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Context = function Context(dhConfig) {
  _classCallCheck(this, Context);
};

exports.default = Context;