"use strict";
// Upwardable
// ==========
exports.__esModule = true;
// The **upwardable** is the key concept in the upward library.
// Upwardables are returned by upwardable functions,
// represent values in upwawrdable objects,
// and have a `change` method to change their values.
// Upwardable Functions
// ====================
// The **upwardable function** is one of the two key components of the upward library,
// along with the **upwardable object**.
// An **upwardable function** is an enhanced function which recomputes itself
// when its inputs or dependencies change.
// Inovking an upwardable function results in a **upwardable**, which holds the value.
// An upwardable is always an object; if primitive, it is wrapped.
var Observable_1 = require("rxjs/Observable");
var Subject_1 = require("rxjs/Subject");
require("rxjs/add/operator/map");
require("rxjs/add/observable/pairs");
require("rxjs/add/observable/of");
var Cfg_1 = require("./Cfg");
var DEBUG_ALL = true;
var DEBUG = Cfg_1.upwardConfig.DEBUG;
// UPW#ARDABLE FUNCTIONS
// Create a function that maps an observable.
function F(project) {
    return function ($) {
        return $.map(project);
    };
}
exports.F = F;
// UPWARDADABLE OBJECTS
// A system-wide mapping of objects to streams of pairs.
var pairs = new WeakMap();
// Create a proxy for an object, so that changes to it emit onto a stream of pairs.
function O(o) {
    var pair$ = new Subject_1.Subject();
    // Remember the stream of pairs for this object to retrieve later.
    pairs.set(o, pair$);
    // Initialize the stream with the current object keys.
    Observable_1.Observable.pairs(o)
        .map(function (tuple) { return ({ prop: tuple[0], value: tuple[1] }); })
        .subscribe(pair$);
    var proxyHandler = {
        set: function (obj, prop, value) {
            obj[prop] = value;
            pair$.next({ prop: prop, value: value });
            return true;
        }
    };
    return new Proxy(o, proxyHandler);
}
exports.O = O;
// Obtain the stream of pairs for some object.
function getPair$(o) {
    return pairs.get(o);
}
exports.getPair$ = getPair$;
// Make a single object into an upwardable.
function U(x) {
    return Observable_1.Observable.of(x);
}
exports.U = U;
