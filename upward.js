var {keys, assign, defineProperty} = Object;

var upwardConfig = {
  LOGGING: true,
  DEBUG: true
};

function objectToString(o) {
  return '{' + keys(o).map(k => `${k}: ${o[k]}`).join(', ') + '}';
}

var id = 0;

function configUpwardable(opts) {
  assign (upwardConfig, opts);
}

function log(...args) {
  if (upwardConfig.LOGGING) {
    console.log('UPWARDIFY:\t', ...args);
  }
}

function valueOf(v) {
    return v == null ? v : v.valueOf();
}

function chainify(fn) {
  return function(...args) { fn.call(this, ...args); return this; };
}

function makeUpwardableProperty(o, p) {
  return Upwardable(o[p], {o, p}).defineAsProperty(o, p);
}

function Upwardable(v, options = {}, upwards = []) {
  console.assert("Cannot make upwardable out of upwardable", !isUpwardable(v));

  function toString() { return `upwardable on ${objectToString(options)}`; }

  var accessor = {
    get: function()   { return upwardable; },
    set: function(nv) {
      upwards.forEach(fn => fn(valueOf(nv), valueOf(v), this, options));
      v = nv; 
    },
    enumerable: true
  };

  var upwardable = {
    valueOf()         { return valueOf(v); },
    upward(fn)        { upwards.push(fn); },
    define(o, p)      { return defineProperty(o, p, accessor); },
  };

  upwardable.define(upwardable, 'val');
  
  if (upwardConfig.DEBUG) {
    assign(upwardable, {id, toString});
    id++;
  }

  return upwardable;
}

function isUpwardable(u) {
  return u && typeof u === 'object' && u.upward;
}

function castUpwardable(u) {
  return isUpwardable(u) ? u : Upwardable(u);
}

function upward(o, fn) {
  return isUpwardable(o) && o.upward(fn);
}

function computedUpwardable(fn, deps) {
  var result = Upwardable();
  function set() { result.val = fn(); }
  deps.forEach(v => upward(v, set));
  set();
  return result;
}

function upwardify(fn, changefn = fn) {
  return function(v) {
    upward(v, changefn.bind(this));
    return fn.call(this, valueOf(v));
  };
}

function upwardifyProperty(o, p) {
  castUpwardable(o[p]).define(o, p);
}

function upwardifyObject(o) {
  keys(o).forEach(k => upwardifyProperty(o, k));
  return o;
}

assign(Function.prototype, {
  chainify(fn)  { return chainify(this); },
  U(changefn)   { return upwardify.call(0, this, changefn); }
});

assign(Object.prototype, {
  U()           { return upwardifyObject(this); }
});

export {
  Upwardable,
  isUpwardable,
  upward,
  computedUpwardable,
  chainify,
  upwardify,
  upwardifyObject,
  configUpwardable
};
