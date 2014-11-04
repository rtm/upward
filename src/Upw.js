// Convenience.

import {objectToString, valueize, mapObject} from './Obj';
import {upwardConfig, upwardableId}          from './Cfg';
import {observeObject, unobserveObject, makeObserver}         from './Obs';
import {omit}                                from './Utl';

var {create, keys, assign, defineProperty, getNotifier, freeze} = Object;
var {push, unshift} = Array.prototype;

// Unused?
function makeUpwardableProperty(o, p) {
  return Upwardable(o[p], {o, p}).defineAsProperty(o, p);
}

// ### Upwardable

// The heart and soul of the upward library.
// An object which remembers its value and upward destinations.

var upwardablePrototype = {
  toString() { return `upwardable on ${objectToString(options)}`; },

  // Make an observer on upwardable properties.
  // This is to turn `modify` events into `update` events on the object.
  makeUpwardablePropertyObserver(p) {
    return function(changes) {
      changes.forEach(
        change =>
          notifier.notify({type: 'update', name: p, object: v, oldValue: change.oldValue})
      );
    };
  },

  // Observe an upwardable property.
  // This is to allow its `modify` events can be reported as `update`s on the object.
  // Store the observer, so it can be removed.
  function observeUpwardableProperty(p) {
    var {v} = this;
    if (v && typeof v === 'object' && p in v) {
      let prop = v[p];
      if (isUpwardable(prop)) {
        Object.observe(
          prop,
          upwardablePropertyObservers[p] = this.makeUpwardablePropertyObserver(p),
          'modify'
        );
      }
    }
  },
  
  // Unobserve an upwardable property.
  // This would be necessary when the property value changes.
  unobserveUpwardableProperty(p) {
    var {v, upwardablePropertyObservers} = this;
    var observer = upwardablePropertyObservers[p];
    if (observer) {
      Object.unobserve(v[p], observer);
      delete upwardablePropertyObservers[p];
    }
  },

  observeAllUpwardableProperties() {
    var {v} = this;
    if (v && typeof v === 'object') {
      keys(v).forEach(this.observeUpwardableProperty, this);
    }
  },

  unobserveAllUpwardableProperties() {
    var {v} = this;
    if (v && typeof v === 'object') {
      keys(v).forEach(this.unobserveUpwardableProperty, this);
    }
  },

  upwardablePropertiesObserver(changes) {
    changes.forEach(change => {
      var {type, name} = change;
      switch (type) {
      case 'update':
      case 'add':    this.observeUpwardableProperties  (name); break;
      case 'delete': this.unobserveUpwardableProperties(name); break;
      }
    });
  },

  observeUpwardableProperties() {
    var {v} = this;
    if (v && typeof v === 'object') {
      Object.observe(v, this.upwardablePropertiesObserver);
    }
  },
  
  unobserveUpwardableProperties() {
    var {v} = this;
    if (v && typeof v === 'object') {
      Object.unobserve(v, this.upwardablePropertiesObserver);
    }
  },
  
  // Listen for 'modify' events on upwardable properties in an object.
  // Pass them along as if the property value itself had changed.
  modifyObserver(changes) {
    changes.forEach(change => {
      if (change.type === 'modify') { this.notifier.notify(change.change); }
    });
  },

  // Loop over all properties, observing them for 'modify' events if they are upwardables.
  observeObjectProperties() {
    var {v} = this;
    mapObject(v, vv => {
      if (isUpwardable(vv)) { Object.observe(vv, modifyObsever); }
    });
  },

  valueOf()  { return valueize(this.v); },
  //  upward(fn) { upwards.push(fn); },
  //    unupward(fn)      { omit(upwards, fn); },
  define(o, p)      { return defineProperty(o, p, accessor()); },

};

// Provide an accessor (getter/setter) to apply to object properties
// (with `#define`).
// The getter returns the upwardable itself.
// The setter notifies a change.
// The property must be enumerable so we copy or `assign` it.
// Notify the upwardable itself that underlying value has changed,
// using the `modify` change type.
var accessor = {
  return {
    get: function()   { 
      return capture(this);
    },
    set: function(nv) {
      var {v} = this;
      if (v !== nv) {
        let oldv;
        
        this.unobserveUpwardProperties();
        [oldv, this.v] = [v, nv];
        this.observeUpwardProperties();
        
        notifier.notify({type: 'modify', name: 'val', object: this, oldValue: oldv});
      }
    },
    enumerable: true
  }
};

defineProperty(UpwardablePrototype, 'val', accessor);

function Upwardable(v, options = {}, upwards = []) {

  if (!this || !(this instanceof Upwardable)) {
    return new Upwardable(v, options);
  }

  defineProperties(this, {
    v: { value: v, writeable: true},
    notifier: { value: getNotifier(u) },
    upwardablePropertyObservers: { value: [] }
  });

  observeObject  (v, notify);
  
  if (upwardConfig.DEBUG) {
    assign(u, {id: upwardableId(), toString});
  }
}

// There are legitimate use cases for an upwardable based on an upwardable.
// In this case, the inferior upwardable simply reports changes to the superior one.
function upwardableFromUpwardable(u) {
  console.assert(isUpwardable(u), "Parameter to upwardableFromUpwardable must be upwardable.");
  var u2 = Upwardable(valueize(u));
  upward(u, nv => u2.val = nv);
  return u2;
}

// Add a prototype method to Upwardable that takes the value as `this`,
// and uses the return value as the new value.
// @TODO: factor out basic notion of upwardifying function.
function addUpwardablePrototypeTransformingMethod(name) {
  upwardablePrototype[name] = function() {
    console.assert(valueize(this)[name], `'${name}' not defined on '${this}'`);
    var get = v => v[name]();
    var u = Upwardable(get(valueize(this)));
    upward(this.val, nv => u.val = get(nv));
    return u;
  };
}

['toUpperCase'].forEach(addUpwardablePrototypeTransformingMethod);

// Perform capture of upward references encountered during a computation.
// Return tuple of result of computation and list of upwardables.
// @TODO Use WeakSet for better GC-ability.
var capturers = [];

function upwardCapture(fn, capturer = []) {
  capturers.unshift(capturer);
  capturer.result = fn();
  return capturers.shift();
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
    return fn.call(this, valueize(v));
  };
}

// `upwardifyWithObjectParam` creates a function which takes a hash as its parameter.
// On the first call, the underlying function is called with the cooked hash.
// When properties in the hash change, a `changefn` is called with the key and new value.
function upwardifyWithObjectParam(fn, changefn = fn) {
  return function(o) {
    upwardifyProperties(o);
    keys(o).forEach(k => upward(o[k], nv => changefn.call(this, k, nv)));
    return fn.call(this, valueizeObject(o));
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
function valueizeObject(o) {
  var result = mapObject(o, valueize);
  var upwardFuncs = {};

  function _upward  (v, i) { upward(v, upwardFuncs[i] = nv => result[i] = valueize(nv)); }
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
  valueizeObject
};
