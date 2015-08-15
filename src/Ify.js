// Functional utilities
// --------------------

// Housekeeping.
import {upwardConfig} from './Cfg';

var {prototype}                        = Function;
var {call, bind, apply}                = prototype;
var {defineProperty, defineProperties} = Object;
var {forEach}                          = Array.prototype;

// Compose functions, calling from right to left.
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((result, val) => val(result), x);
  };
}

// Create a function which runs on next tick.
function tickify(fn, {delay} = {}) {
  delay = delay || 10;
  return function() {
    return setTimeout(() => fn.apply(this, arguments), delay);
  };
}

// Transform a function so that it always returns `this`.
function chainify(fn) {
  return function(...args) {
    fn.call(this, ...args);
    return this;
  };
}

// Make a function which returns itself, allowing syntax `fn(x)(y)`.
function selfify(fn) {
  return function selfified() {
     fn.apply(this, arguments);
     return selfified;
  };
}

// Make a function which takes arguments in reverse order.
function swapify(fn) {
  return function(a, b) {
    return fn.call(this, b, a);
  };
}

// Make a function which drops some leading arguments.
function dropify(fn, n = 1) {
  return function(...args) {
    return fn.apply(this, [...args].slice(n));
  };
}

// Make a function which memozies its result.
function memoify(fn, {hash, cache} = {}) {
  hash = hash || identify;
  cache = cache = {};
  function memoified(...args) {
    var key = hash(...args);
    return key in cache ? cache[key] : cache[key] = fn.call(this, ...args);
  }
  memoified.clear = () => cache = {};
  return memoified;
}

// Make a function with some pre-filled arguments.
function argify(fn, ...args1) {
  return function(...args2) {
    return fn.call(this, ...args1, ...args2);
  };
}

// Return the function if it is one.
function maybeify(fn) {
  return typeof fn === 'function' ? fn : fixed(fn);
}

// Make a function which inverts the result.
function invertify(fn) {
  return function() {
    return !fn.apply(this, arguments);
  };
}

// Make a function which throws away some args.
function trimify(fn, n = 1) {
  return function(...args) {
    return fn.call(this, ...args.slice(0, n));
  };
}

// Make a function which throws away some args at the end.
function trimifyRight(fn, n = 1) {
  return function(...args) {
    return fn.call(this, ...args.slice(0, -n));
  };
}

// Make a version of the function which logs entry and exit.
function logify(fn) {
  return function() {
    console.log("entering", fn.name);
    var ret = fn.apply(this, arguments);
    console.log("leaving", fn.name);
    return ret;
  };
}

// Make a function bound to itself, allowing function to access itself with `this`.
function selfthisify(fn) {
  return fn.bind(fn);
}

// Make a function which calls some function for each argument, returning array of results.
function repeatify(fn) {
  return function(...args) {
    return [...args].map(fn, this);
  };
}

// Make create a version of a function which runs just once on first call.
// Returns same value on succeeding calls.
function onceify(f) {
  var ran, ret;
  return function() {
    return ran ? ret : (ran=true, ret=f.apply(this,arguments));
  };
}

// Create a function with an inserted first argument equal to the created function.
// Possible use case is:
// ```
// e.addEventListerner("click", insertselfify(function(self, evt) {
//   // do stuff on event;
//   e.removeEventListener(self);
// }));
// ```
function insertselfify(fn) {
  return function x(...args) {
    return fn.call(this, x, ...args);
  };
}

// Create a function with a prelude and postlude.
function wrapify(fn, before = noop, after = noop) {
  return function(...args) {
    before.call(this);
    var ret = fn.call(this, ...args);
    after.call(this);
    return ret;
  };
}

function debugify(fn) {
  return function(...args) {
    /*jshint debug: true */
    debugger;
    return fn.call(this, ...args);
  };
}


// Return an array of argument names.
// WARNING: parsing JS with regexps!
// Will fail on deconstructed parameters.
// @TODO Handle parameters with defaults.
function paramify(fn){
  //get arguments to function as array of strings
  var args=fn.args=fn.args||      //cache result in args property of function
      fn.toString()               //get string version of function
      .replace(/\/\/.*$|\/\*[\s\S]*?\*\//mg, '')   //strip comments
      .match(/\(.*?\)/m)[0]       //find argument list, including parens
      .match(/[^\s(),]+/g)        //find arguments
  ;
  return args; // or fn?
}

// Return function body.
function parseBody(fn){
  //get arguments to function as array of strings
  var body=fn.body=fn.body||      //cache result in `body` property of function
      fn.toString()               //get string version of function
      .replace(/\/\/.*$|\/\*[\s\S]*?\*\//mg, '')   //strip comments
      .replace(/^\s*$/mg, '')     // kill empty lines
      .replace(/^.*?\)\s*\{\s*(return)?\s*/, '') // kill argument list and leading curly
      .replace(/\s*\}\s*$/, '')   // kill trailing curly
  ;
  return body; // or fn?
}

// Return an object of named function parameters and their values.
// Invoke as `paramsAsObject(thisFunction, arguments);`.
function paramsAsObject(fn, args) {
  return objectFromLists(paramify(fn), args);
}

// Function which does nothing.
function noop() { }

// Function which returns its argument.
function identity(x) {
  return x;
}

// Function which always returns the same value.
function fixed(c) {
  return () => c;
}

// Function which inverts its argument.
function invert(c) {
  return !c;
}

// Place a function transformer on the Function prototype.
// This allows it be used as `fn.swapify(1,2)`.
function prototypeize(fn, name = fn.name) {
  if (name) { // IE11 does not support name
    defineProperty(prototype, name, {
      get: function() { return fn(this); }
    });
  }
}

// Provide versions on function prototype that can be called as
// function.swapify(1, 2).
if (upwardConfig.MODIFY_BUILTIN_PROTOTYPES) {
  let flag = 'UPWARD_MODIFIED_BUILTIN_PROPERTIES';
  if (!prototype[flag]) {
    [
      tickify, chainify, selfify, memoify, swapify, dropify, argify, invertify,
      trimify, selfthisify, repeatify, onceify, insertselfify, wrapify, paramify, logify
    ]
      .forEach(trimify(prototypeize));
    defineProperty(prototype, flag, { value: true });
  }
}

export {
  compose,

        tickify,
       chainify,
        selfify,
        memoify,
        swapify,
        dropify,
         argify,
      invertify,
       maybeify,
    selfthisify,
      repeatify,
        onceify,
  insertselfify,
        wrapify,
       debugify,
       paramify,
         logify,

  parseBody,

  noop,
  identity,
  invert,
  fixed
};
