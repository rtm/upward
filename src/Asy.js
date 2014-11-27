// Asynchronous functions
// ======================

var {assign, defineProperty, observe, unobserve} = Object;

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
  };
}

function castPromise(p) {
  return p && typeof p === 'object' && p.then ? p : Promise.resolve(p);
}

function *generateForever(f) {
  while (true) yield f();
}

export {
  spawn,
  timeout,
  PromiseQueue,
  promiseChanges,
  castPromise,
  Deferred,
  generateForever
};
