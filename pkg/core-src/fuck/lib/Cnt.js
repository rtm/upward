"use strict";
// Counter as computable.
// ======================
exports.__esModule = true;
// Is this even necessary?
// TODO: add Obsevable.timer-like functionality.
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/interval");
function Cnt(ms) {
    if (ms === void 0) { ms = 1000; }
    return Observable_1.Observable.interval(ms);
}
exports.Cnt = Cnt;
