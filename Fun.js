function laterify(fn) {
  return b => b ? setTimeout(fn) : fn();
}

// Transform a function so that it always returns `this`.
function chainify(fn) {
  return function(...args) { fn.call(this, ...args); return this; };
}

export {
  laterify,
  chainify
};
