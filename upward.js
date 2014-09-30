import {laterify} from 'Fun';
var {keys, assign, defineProperty} = Object;

// ### Configuration

// Control upward configuration with `LOGGING` and `DEBUG` flags.
var upwardConfig = {
  LOGGING: true,
  DEBUG: true
};

// Keep a counter which identifies upwardables for debugging purposes.
var id = 0;

// Set configuration options.
function configureUpwardable(opts) {
  assign (upwardConfig, opts);
}

function objectToString(o) {
  return '{' + keys(o).map(k => `${k}: ${o[k]}`).join(', ') + '}';
}

function log(...args) {
  if (upwardConfig.LOGGING) {
    console.log('UPWARDIFY:\t', ...args);
  }
}

// Generic version of `valueOf` which works for anything.
function valueOf(v) {
    return v == null ? v : v.valueOf();
}

// Analog of `Array#map` for objects.
function mapObject(o, fn, ctxt) {
  return keys(o).reduce((result, k) => result[k] = fn.call(ctxt, o[k]), result);
}

// Return an object all of the values of which are evaluated.
function valueObject(o) {
  return mapObject(o, valueOf);
}

// Return an aray all of the values of which are evaluated.
function valueArray(a) {
  return a.map(valueOf);
}

function objectValues(o) {
  return keys(o).map(k => o[k]);
}

function makeUpwardableProperty(o, p) {
  return Upwardable(o[p], {o, p}).defineAsProperty(o, p);
}

function Upwardable(v, {once, later, disable} = {}, upwards = []) {
  console.assert("Cannot make upwardable out of upwardable", !isUpwardable(v));

  function toString() { return `upwardable on ${objectToString(options)}`; }

  var send = laterify(() =>
    upwards.forEach(fn => fn(valueOf(nv), valueOf(v), upwardable, options));
  );

  var accessor = {
    get: function()   { return upwardable; },
    set: function(nv) {
      if (!disable) {
        send(later);
        v = nv;
        disable = once;
      }
    },
    enumerable: true
  };

  var upwardable = {
    valueOf()        { return valueOf(v); },
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

// Check if something is upwardable, by looking for its `upward` property.
function isUpwardable(u) {
  return u && typeof u === 'object' && u.upward;
}

// Make something upwardable if it isn't already.
function castUpwardable(u) {
  return isUpwardable(u) ? u : Upwardable(u);
}

// Safely set an upward relationship, or not..
function upward(o, fn) {
  return isUpwardable(o) && o.upward(fn);
}

// Create an upwardable whose value is given by a function.
// When any of the specified dependencies change, the value is recomputed,
// triggering the upward behavior.
function computedUpwardable(fn, deps) {
  var result = Upwardable();
  function set() { result.val = fn(); }
  deps.forEach(v => upward(v, set));
  set();
  return result;
}

// Transform a function to make it upward-aware.
// The first time, it calls the passed-in function, maintaining context.
// When things change, it calls an alternative function.
function upwardify(fn, changefn = fn) {
  return function(v) {
    upward(v, changefn.bind(this));
    return fn.call(this, valueOf(v));
  };
}

// `upwardifyWithObjectParam` creates a function which takes a hash as its parameter.
// On the first call, the underlying function is called with the cooked hash.
// When properties in the hash change, a `changefn` is called with the key and new value.
function upwardifyWithObjectParam(fn, changefn) {
  return function(o) {
    upwardifyProperties(o);
    keys(o).forEach(k => upward(o[k], nv => changefn(k, nv)));
    return fn.call(this, valueOfObject(o));
  };
}

// A common case for functions taking a hash as argument is to want to merge (assign)
// the property/value pairs into an underlying hash, 
// which should then be updated when the hash changes.
// `upwardifyAssign` turns a hash into a function which modifies it.
// It is passed on a function yielding the hash to be assigned to.
function upwardifiedAssign(fn) {
  return upwardifyWithObjectParam(
    oo => assign(fn.call(this), oo),
    (p, v) => fn.call(this)[p] = v
  );
}
    
// `upwardifyProperty` modifies a single property on an object for upwardability.
// This is mainly used from 'upwardifyProperties` below.
function upwardifyProperty(o, p) {
  castUpwardable(o[p]).define(o, p);
  return o;
}

// `upwardifyProperties` modifies all properties in an object, in place, for upwardability.
// A non-enumerable `upwardified` property is added to the object.
// Note this is *not* the same as making the object itself upwardable.
function upwardifyProperties(o) {
  if (!o.upwardified) {
    keys(o).forEach(k => upwardifyProperty(o, k));
    defineProperty(o, 'upwardified', { value: true });
  }
  return o;
}

export {
  Upwardable,
  isUpwardable,
  upward,
  computedUpwardable,
  upwardify,
  upwardifyProperties,
  configureUpwardable
};
