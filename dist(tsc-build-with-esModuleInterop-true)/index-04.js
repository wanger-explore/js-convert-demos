"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.fruit = void 0;
exports.fruit = "apple";
var log = function () {
    var logs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        logs[_i] = arguments[_i];
    }
    console.log.apply(console, logs);
};
exports.log = log;
exports.default = {
    name: "esm default",
};
