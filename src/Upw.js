// Convenience.

import {objectToString, valueOf, mapObject, objectPairs} from './Obj';
import {upwardConfig, upwardableId} from './Cfg';
import {tickify, maybeify, propGetter} from './Fun';

var {create, keys, assign, defineProperty} = Object;
var {push, unshift} = Array.prototype;

// Unused?
function makeUpwardableProperty(o, p) {
  return Upwardable(o[p], {o, p}).defineAsProperty(o, p);
}

// ### Upwardable

// The heart and soul of the upward library.
// An object which remembers its value and upward destinations.
function Upwardable(v, options = {}, upwards = []) {

  function toString() { return `upwardable on ${objectToString(options)}`; }
  var {once, later, disable} = options;

	if (isUpwardable(v)) { return upwardableFromUpwardable(v); }

	var send_upward = tickify(function(nv) {
    upwards.forEach(fn => fn(valueOf(nv), valueOf(v), u, options));
	});

  // Provide an accessor (getter/setter) to apply to object properties
  // (with `#define`).
  // The getter returns the upwardable itself.
  // The setter notifies upward dependencies, and sets the internal value.
  // The property must be enumerable so we copy or `assign` it.
  var accessor = {
    get: function()   { 
			return capture(u);
    },
    set: function(nv) {
      if (!disable && v !== nv) {
				send_upward(nv);
        v = nv;
        disable = once;
      }
    },
    enumerable: true
  };

  // The upwardable consists of four properties, `valueOf`, `upward`, `define`, and `val`.
  // `#valueOf` returns the value of the underlying value.
  // `#upward` adds an upward dependency.
  // Usually called via the `upward` routine which ensures upwardability.
  // `#define` applies to the accessor to a specified object property.
  var u = assign(create(upwardablePrototype), {
    valueOf()        { return valueOf(v); },
    upward(fn)        { upwards.push(fn); },
    unupward(fn)      { upwards.omit(fn); },
    define(o, p)      { return defineProperty(o, p, accessor); },
  });

  u.define(u, 'val');
  
  if (upwardConfig.DEBUG) {
    assign(u, {id: upwardableId(), toString});
  }

  return u;
}

// There are legitimate use cases for an upwardable based on an upwardable.
// In this case, the inferior upwardable simply reports changes to the superior one.
function upwardableFromUpwardable(u) {
	console.assert(isUpwardable(u), "Parameter to upwardableFromUpwardable must be upwardable.");
  var u2 = Upwardable(valueOf(u));
  upward(u, nv => u2.val = nv);
  return u2;
}

// For convenience, allow methods on values to be applied directly to upwardables.
// Is this necessary any longer?
var upwardablePrototype = {};

// Add a prototype method to Upwardable that takes the value as `this`,
// and uses the return value as the new value.
// @TODO: factor out basic notion of upwardifying function.
function addUpwardablePrototypeTransformingMethod(name) {
	upwardablePrototype[name] = function() {
		console.assert(valueOf(this)[name], `'${name}' not defined on '${this}'`);
		var get = v => v[name]();
		var u = Upwardable(get(valueOf(this)));
		upward(this.val, nv => u.val = get(nv));
		return u;
	};
}

['toUpperCase'].forEach(addUpwardablePrototypeTransformingMethod);

// Perform capture of upward references encountered during a computation.
// Return tuple of result of computation and list of upwardables.
// @TODO Use WeakSet for better GC-ability.
var capturers = [];

function upwardCapture(fn, capturer = new Map()) {
  capturers.unshift(capturer);
  return [fn(), capturers.shift()];
}

// Mark an upwardable as captured. Called from `get` accessor.
function capture(u) {
  if (capturers.length) {
    capturers[0].push(u);
  }
  return u;
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

// Remove an upward relationship.
function unupward(o, fn) {
  return isUpwardable(o) && o.unupward(fn);
}

// Create an upwardable whose value is given by a function.
// When any of the dependencies change, the value is recomputed,
// triggering the upward behavior.
function computedUpwardable(fn, ctxt) {
  fn = fn.bind(ctxt);
  reporters.push(udep => upward(udep, () => u.val = fn()));
  var u = Upwardable(fn());
  reporters.pop();
  return u;
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
function upwardifyWithObjectParam(fn, changefn = fn) {
  return function(o) {
    upwardifyProperties(o);
    keys(o).forEach(k => upward(o[k], nv => changefn.call(this, k, nv)));
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
// Objects whose properties have been upwardified are recorded in a weakset.
// @TODO: use a WeakSet for this to avoid polluting object.

var upwardifiedObjectProp = '__upwardifed';

function markUpwardifiedObject(o) {
  defineProperty(o, upwardifiedObjectProp, { value: true });
}

function isUpwardifiedObject(o) {
  return o[upwardifiedObjectProp];
}

function upwardifyProperties(o) {
  if (!isUpwardifiedObject(o)) {
    keys(o).forEach(k => upwardifyProperty(o, k));
    markUpwardifiedObject(o);
  }
  return o;
}

// Create a mirrored object which is updated as the underlying object changes.
// Dereference upwardable property values.
function valueOfObject(o) {
  var result = mapObject(o, valueOf);
  var upwardFuncs = {};

  function _upward  (v, i) { upward(v, upwardFuncs[i] = nv => result[i] = valueOf(nv)); }
  function _unupward(v, i) { unupward(oldValue, upwardFuncs[i]); }

  function add      (v, i)             { _upward(v, i); }
  function update   (v, i, {oldValue}) { _unupward(oldValue, i); _upward(oldValue, i); }
  function _delete  (v, i, {oldValue}) { _unupward(oldValue, i); delete upawrdFuncs[i]; }

  observeObject(o, makeObserver({add, update, delete:_delete}));
  return result;
}

export {
  Upwardable,
  computedUpwardable,
  upwardifyProperties,
	upwardifyWithObjectParam,
  isUpwardable,
  upward,
  unupward,
  upwardify,
	mirrorProperties,
	upwardCapture,
  upwardablePrototype,
  upwardifiedObject,
  valueOfObject
};
