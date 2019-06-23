// Asynchronous functions
// ======================

var {assign, defineProperty, observe, unobserve} = Object;
var {apply} = Function.prototype;

import {upwardConfig} from './Cfg';

// Return a promise for some time in the future,
// passing through the invoking promise's value:
// ```
// Promise.resolve(99).then(wait(250)) // promise value is 99
// ```
function wait(ms = 0) {
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


// Make a generator which calls a function over and over.
// Each iteration's arguments are the parameters passed to `iterate.next()`.
function generateForever(f, init = null) {
  return function *_generateForever() {
    var args = yield init;
    while (true) args = yield f.apply(0, args);
  };
}

// "Promisify" a function, meaning to create a function which returns a promise
// for the value of the function once `this` and all arguments have been fulfilled.
function promisify(f) {                              // given an underlying function,
  return function _promisify(...args) {              // return a function which
    return new Promise(                              // returns a promise
      resolve => Promise.all([this, ...args])        // which, when all args are resolved,
        .then(
          parms => resolve(f.call(...parms))         // resolves to the function result
        )
    );
  };
}

export {
  wait,
  promiseChanges,
  Deferred,
  generateForever,
  promisify
};
