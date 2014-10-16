// Functional utilities
// --------------------

import {upwardConfig} from './Cfg';

// Create a delayed version of a function.
function tickify(fn, {delay = 10} = {}) {
  return function() {
		return setTimeout(() => fn.apply(this, arguments), delay);
	}
}

// Transform a function so that it always returns `this`.
function chainify(fn) {
  return function(...args) { fn.call(this, ...args); return this; };
}

// Make a function which returns itself.
// This supports the odd syntax fn(x)(y).
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

// Make a function which some pre-filled arguments.
function argify(fn, ...args1) {
	return function(...args2) {
		return fn.call(this, ...args1, ...args2);
  };
}

// Make a function which inverts the result.
function invertify(fn) {
	return function() {
		return !fn.apply(this, arguments);
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

// Call a function, if it's a function.
function maybe(fn) {
	return typeof fn === 'function' ? fn() : fn;
}

// Provide versions on function prototype that can be called as
// function.swapify(1, 2).
if (upwardConfig.MODIFY_BUILTIN_PROTOTYPES) {
  [tickify, chainify, selfify, memoify, swapify, argify, invertify]
		.forEach(fn => Function.prototype[fn.name] = function(...args) {
			return fn(this)(...args);
		});
}



export {
  tickify,
  chainify,
	selfify,
  memoify,
	swapify,
  argify,
	invertify,

  identity,
	invert,
  maybe,
  fixed
};

