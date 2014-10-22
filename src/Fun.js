// Functional utilities
// --------------------

// Housekeeping.
import {upwardConfig} from './Cfg';

var {prototype}                        = Function;
var {call, bind, apply}                = prototype;
var {defineProperty, defineProperties} = Object;
var {forEach, map}                     = Array.prototype;

// Compose functions, calling from right to left.
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((result, val) => val(result), x);
	};
}

// Create a function which runs on next tick.
function tickify(fn, {delay = 10} = {}) {
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
		return fn.call(this, [...args].slice(n));
	};
}

// Make a function which memozies its result.
function memoify(fn, {hash = identity, cache = {}} = {}) {
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
  return function() {
		return map.call(arguments, fn, this);
	};
}

// Transform function taking O.o change record into one with forEach signature.
function changeRecordSignaturify(fn, ctxt) {
  return function({name, object, oldValue}) {
    return fn.call(ctxt, object[name], name, oldValue, object);
  };
}

// Make a function which returns a property on `this`.
function propGetter(p) {
  return function() {
    return this[p];
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
// This allows it be used as `fn.swapify(1,2)`.
function prototypeize(fn, name = fn.name) {
  defineProperty(prototype, name, {
    get: function() { return fn(this); }
  });
}

// Provide versions on function prototype that can be called as
// function.swapify(1, 2).
if (upwardConfig.MODIFY_BUILTIN_PROTOTYPES) {
	let flag = 'UPWARD_MODIFIED_BUILTIN_PROPERTIES';
	if (!prototype[flag]) {
		[tickify, chainify, selfify, memoify, swapify, dropify, argify, invertify, trimify, selfthisify, repeatify, logify]
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
  changeRecordSignaturify,
	logify,

  propGetter,

  identity,
	invert,
  fixed
};
