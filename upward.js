var {keys, assign, defineProperty, defineProperties, getOwnPropertyDescriptor} = Object;

var upwardableConfig = {
  LOGGING: true,
  DEBUG: true
};

function configUpwardable(opts) {
  assign (upwardableConfig, opts);
}

function log(...args) {
  if (upwardableConfig.LOGGING) {
    console.log(...args);
  }
}

function _valueOf(v) {
    return v == null ? v : v.valueOf();
}

function chainify(fn) {
  return function() { fn.apply(this, arguments); return this; };
}

var upwardableCount = 0;

function Upwardable(v, options = {}) {
  if (isUpwardable(v)) { return v; }

  var upwards   = [];

  var valueOf   =  () => _valueOf(v);
  var set       = nv => { propagate(nv); v = nv; return this; };
  var get       = () => ret;

  var upward    = fn => upwards.push(fn);
  var propagate = nv => upwards.forEach(fn => fn(valueOf(nv), valueOf(v), this, options));

  var ret       = {get, set, valueOf, upward};

  if (upwardableConfig.DEBUG) {
    ret.count  = upwardableCount++;
  }

  return ret;
}

function isUpwardable(x) {
  return x && typeof x === 'object' && x.upward;
}

function addUpward(o, fn) {
    return isUpwardable(o) && o.upward(fn);
}

function computedUpwardable(fn, deps) {
  var result = Upwardable();
  function set() { result.set(fn()); }
  deps.forEach(v => addUpward(v, set));
  set();
  return result;
}

function upwardablePropertyDescriptor(o, p) {
  var v = o[p];
  if (isUpwardable(v)) {
    return getOwnPropertyDescriptor(o, p);
  }
  var {get, set} = Upwardable(v, {o, p});
  return { get, set, enumerable: true };
}

function defineUpwardableProperty(o, p) {
  return defineProperty(o, p, upwardablePropertyDescriptor(o, p));
}

function upwardify(fn, changefn = fn) {
  return function(v) {
    addUpward(v, changefn.bind(this));
    return fn.call(this, v.valueOf());
  };
}

function upwardifyObject(o) {
  return defineProperties({}, keys(o).reduce((result, k) => {
    result[k] = upwardablePropertyDescriptor(o, k);
    return result;
  }, {}));
}

assign(Function.prototype, {
  chainify: function Function$chainify(fn) { 
    return chainify(this); 
  },
  upwardify: function Function$upwardify(changefn) {
    return upwardify.apply(0, this, changefn || this);
  }
});

assign(Object.prototype, {
  upwardify: function Object$upwardify() {
    return upwardifyObject(this);
  }
});

export {
  Upwardable,
  isUpwardable,
  addUpward,
  computedUpwardable,
  chainify,
  upwardify,
  upwardifyObject,
  defineUpwardableProperty,
  configUpwardable
};
