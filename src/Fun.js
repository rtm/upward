// Functional utilities
// --------------------

// Housekeeping.
import {upwardConfig} from './Cfg';

var {call, bind, apply} = Function.prototype;
var {defineProperty} = Object;
var {forEach, map} = Array.prototype;

// Create a delayed version of a function.
function tickify(fn, {delay = 10} = {}) {
  return function() {
		return setTimeout(() => fn.apply(this, arguments), delay);
	};
}

// Transform a function so that it always returns `this`.
function chainify(fn) {
  return function(...args) {
		fn.call(this, ...args); return this;
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

// Make a function which memozies its result.
function memoify(fn, {hash = x => x, cache = {}} = {}) {
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
  }
}

// Make a function bound to itself, allowing function to access itself with `this`.
function selfthisify(fn) {
  return fn.bind(fn);
}

// Make a function which calls some function for each argument, returning array of results.
function repeatify(fn) {
  return function() {
		return map.call(arguments, fn, this);
	};
}

// Function which returns its argument.
function identity() {
	return x => x;
}

// Function which always returns the same value.
function fixed(c) {
  return _ => c;
}

// Function which inverts its argument.
function invert(c) {
	return !c;
}

// Place a function transformer on the Function prototype.
// This allows it be used as fn.swapify(1,2).
function prototypeize(fn, name = fn.name) {
  defineProperty(Function.prototype, name, {
    get: function() { return fn(this); }
  });
}

// Provide versions on function prototype that can be called as
// function.swapify(1, 2).
var setFunctionMethods;
if (false && !setFunctionMethods && upwardConfig.MODIFY_BUILTIN_PROTOTYPES) {
  [tickify, chainify, selfify, memoify, swapify, argify, invertify, trimify, selfthisify, repeatify]
		.forEach(trimify(prototypeize));
  setFunctionMethods = true;
}

export {
  tickify,
  chainify,
	selfify,
  memoify,
	swapify,
  argify,
	invertify,
  maybeify,
	selfthisify,
	repeatify,

  identity,
	invert,
  fixed
};



