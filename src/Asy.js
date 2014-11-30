// Asynchronous functions
// ======================

var {assign, defineProperty, observe, unobserve} = Object;
var {apply} = Function.prototype;

import {upwardConfig} from './Cfg';

// Run values from a generator through promises.
// Return a promise for when everything is done.
function spawn(generator) {
  var iterator = generator();
  
  return new Promise(
    resolve =>
      (function iterate(val) {
        var {value, done} = iterator.next(val);
        if (done) { resolve(val); }
        else { Promise.resolve(value).then(iterate); }
      }())
  );
  
}

// Return a promise for some time in the future,
// passing through the invoking promise's value:
// ```
// Promise.resolve(99).then(timeout(250)) // promise value is 99
// ```
function timeout(ms = 0) {
  return function(val) {
    return new Promise(resolve => setTimeout(_ => resolve(val), ms));
  };
}

// Implement Promise.done.
// Use may set Promise.onDoneError to trap errors.
function _throw(e) { throw e; }
if (!Promise.prototype.done) {
  defineProperty(Promise.prototype, 'done', {
    value: function(fulfill, reject) {
      return this
        .then(fulfill, reject)
        .catch(e => setTimeout(Promise.onDoneError || _throw, 1, e));
    }
  });
}

// Implement `get` on promises.
if (!Promise.prototype.get) {
  defineProperty(Promise.prototype, 'get', {
    value: function(prop) { return this.then(o => o[prop]); }
  });
}

// Create a `Deferred` object, a combination of a promise and its
// resolve and reject functions.
function Deferred() {
  var deferred = {};
  deferred.promise = new Promise(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject  = reject;
  });
  return deferred;
}

// Implement `defer` on `Promise`.
if (upwardConfig.MODIFY_BUILTIN_PROTOTYPE && !Promise.defer) {
  defineProperty(Promise, 'defer', {
    value: Deferred
  });
}

// Promise queues.
// See https://github.com/kriskowal/gtor.
function PromiseQueue() {
  var ends = Promise.defer();    // not in spec, but in Chrome
  this.put = function (value) {
    var next = Promise.defer();
    ends.resolve({head: value, tail: next.promise});
    ends.resolve = next.resolve;
  };
  this.get = function () {
    var result = ends.promise.get('head');
    ends.promise = ends.promise.get('tail');
    return result;
  };
}

// Promise from one-time Object.observe.
// Usage: ```promiseChanges(obj, ['update']).then(function(changes) {...`
function promiseChanges(object, types) {
  return new Promise(function(resolve) {
    function observer(changes) {
      resolve(changes);
      unobserve(object, observer);
    }
    observe(object, observer, types);
  });
}

function castPromise(p) {
  return p && typeof p === 'object' && p.then ? p : Promise.resolve(p);
}

// Make a generator which calls a function over and over.
// Each iteration's arguments are the parameters passed to `iterate.next()`.
function generateForever(f, init = null) {
  return function *_generateForever() {
    var args = [];
    yield init;
    while (true) args = yield f.apply(0, args);
  };
}

// "Promisify" a function, meaning to create a function which returns a promise
// for the value of the function once all arguments have been fulfilled.
function promisify(f) {                              // given an underlying function,
  return function _promisify(...args) {              // return a function which
    return new Promise(                              // returns a promise
      resolve => Promise.all(args)                   // which, when all args are resolved,
        .then(args => resolve(f.apply(this, args)))  // resolves to the function result
    );
  };
}

export {
  spawn,
  timeout,
  PromiseQueue,
  promiseChanges,
  castPromise,
  Deferred,
  generateForever,
  promisify
};
