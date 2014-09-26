/* jshint esnext: true */

var {defineProperty, create, keys, defineProperties} = Object;
var {join, push} = Array.prototype;

var valueOf = v => v.valueOf();

var chainify = fn => function() { fn.apply(this, arguments); return this; };

function Upwardable(v, data) {
  if (isUpwardable(v)) { return v; }

  var upwards       = [];

  var valueOf       = () => v === null || v === undefined ? v : v.valueOf();
  var set           = nv => { propagate(nv); v = nv; return this; };
  var get           = () => ret;

  var upward        = push.bind(upwards);
  var ununpward     = null;
  var propagate     = nv => upwards.forEach(fn => fn(nv.valueOf(), v.valueOf(), data, this));
  
  var ret           = {get, set, valueOf, upward};
  
  var onward        = function(f, ...args) {
    function go() { return f.apply(this.valueOf(), ...args); }
    upward(go);
    return go();
  };
  
  return ret;
}

var isUpwardable = x => x && typeof x === 'object' && x.upward;

function upwardablePropertyDescriptor(val, prop) {
  var {get, set} = Upwardable(val, prop);
  return { get, set, enumerable: true };
}

function defineUpwardableProperty(obj, prop, val) {
  return isUpwardable(val) ? val : 
    defineProperty(obj, prop, upwardablePropertyDescriptor(val, prop));
}

var upward = (o, fn) => o.upward && o.upward(fn);


function upwardify(fn, changefn = fn) {
  return function(v) {
    upward(v, changefn.bind(this));
    return fn.call(this, v.valueOf());
  };
}

function upwardifyObject(o) {
  return defineProperties({}, keys(o).reduce((result, k) => {
    result[k] = upwardablePropertyDescriptor(o[k], k);
    return result;
  }, {}));
}

export {
  Upwardable,
  isUpwardable,
  chainify,
  upwardify,
  upwardifyObject,
  defineUpwardableProperty
};
