"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = exports.fruit = exports["default"] = void 0;
var fruit = "apple";
exports.fruit = fruit;

var log = function log() {
  var _console;

  (_console = console).log.apply(_console, arguments);
};

exports.log = log;
var _default = {
  name: "esm default"
};
exports["default"] = _default;