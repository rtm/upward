// Functional utilities
// --------------------

// Create a delayed version of a function.
function laterify(fn, {delay = 10} = {}) {
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

export {
  laterify,
  chainify,
	selfify,
  memoify,
	swapify
};

