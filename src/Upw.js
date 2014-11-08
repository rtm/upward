// Upwardable
// ==========

// The heart and soul of the upward library.
// Define An object which remembers its value and can report on changes.

// The behavior of upwardables is as follows:
//
// `a = U(5) is an upwardable on a primitive.
// `a` returns the upwardable.
// To obtain its value, do `V(a)`.
// `a = x` overwrites the variable, obviously.
// `a.set(v)` is used to change the underlying value.
// This generates an observable `'upward'` change on the upwarable.
//
// In something like `[1, 2, U(3), 4, 5]`, things work as expected.
//
// `a = U([1, 2, 3])` creates an upwardable on an array.
// It is equivalent to `U([U(1), U(2), U(3)])`.
// Therefore, `a[0]` returns an upwardable on 1.
// Its value could be obtained by `+a[0]` or `V(a[0])`.
// However, `a[0]` sets the **underlying value** on that upwardable.
// Such a change is notified as an 'update' on the upwardable.
// It can also be observed as an `'upward'` change on the upwardable.
//
// 

// Convenience.
var {create, keys, assign, getNotifier, observe, unobserve, defineProperty} = Object;

import {isObject, valueize, mapObject} from './Obj';

// A list of all upwardables. Used to determine upwardified-ness.
var upwardables = new WeakSet();

function isUpwardable(u) {
  return upwardables.has(Object(u));
}

// A list of all objects which have been upwardified.
// Used to prevent creating new upwardifieds on same object.
var upwardifieds = new WeakMap();

// Constructor for upwardable object.
// Skip construction and return an existing upwardable if one exists.
function U(v) {
  var u;

  if (upwardables.has(Object(v))) return v;

  u = upwardifieds.get(Object(v));

  if (!u) {
    u = createUpwardable(v);
    upwardables.add(u);
    upwardifieds.set(Object(v), u);
  }

  return u;
}

// Return string representation of upwardable.
function upwardableToString(u) {
  console.assert(upwardables.has(u), "Cannot stringify non-upwardable object.");
  return `U (='${valueize(u)}')`;
}

// Upwardable prototype. Heavily adorned elsewhere with methods.
var upwardablePrototype = Object.create(null, {
  toString: { value: function() { return upwardableToString(this); } }
});

// Create a new upwardable.
// This is an ultra-lightweight object wrapping a value with getter and setter.
function createUpwardable(v) {
  console.assert(arguments.length === 1, "createUpwardable() takes exactly one argument.");
  console.assert(!isUpwardable(v), "Cannot create upwardable from upwardable.");

  var u = create(upwardablePrototype, {
    valueOf: { value: _  => v },   // get value, with capture handling
    set: {
      value: function(nv) {
        var oldValue = v;
        if (nv === v) { return; }
        if (isObject(v)) shadower.off();
        v = nv;
        if (isObject(v)) shadower.on(v);
        
        // Notify an `'upward'` change on the upwardable.
        getNotifier(u).notify({type: 'upward', object: u, oldValue});
      }
    }
  });

  var shadower = makeShadower(u);
  if (isObject(v)) shadower.on(v);
  
  return u;
}

// Create on/off switches for handling object-valued upwardables.
function makeShadower(u) {

  // Create an observer to set up new or deleted properties.
  // Not tested and probably not working.
  function observer(changes) {
    notifier.notify(u, {type: 'upward'});
    changes.forEach(change => {
      var {type, name} = change;
      switch (type) {
      case 'delete': delete u[name]; break;
      case 'add': upwardifyProperty(name);
      }
    });
  }

  // Turn on shadowing for an underlying object.
  function on(v) {

    // Set up a shadow property on upwardable.
    function upwardifyProperty(p) {
      var up = U(v[p]);
      
      // Place shadow properties directly on upwardable.
      defineProperty(u, p, {
        set(v) { up.set(v); },
        get()  { return capture(up); },
        enumerable: true
      });
      
      // Pass through `'upward'` changes on upwardable properties as `'update'` events on shadowed prop.
      observe(up, changes => changes.forEach(change => {
        var {oldValue} = change;
        const type = 'update';
        notifier.notify({name: p, oldValue, type}); // what about object?
      }), ['upward']);
    }
    
    keys(v).forEach(upwardifyProperty);
    
    // Watch for properties being changed on underlying object.
    // This applies, for instance, in case of `u = U(v); v.newprop = 99;`.
    observe(v, observer);
    
    // Watch for properties being changed on upwarded object.
    // This applies, for instance, in case of `u = U(v); u.newprop = 99;`.
    // function upwardPropertiesObserver(changes) {
    //   changes.forEach(change => notifier.notify({type: 'update', name: change.name}));
    // }
    // Report add/delete/update changes to upwardable as `'upward'` change type.
    observe(u, changes => notifier.notify({type: 'upward'}));
  }

  // Turn off shadowing for an underlying object when swapped out.
  // Not implemented.
  function off(v) {
  }
  
  var notifier = getNotifier(u);
  return {on, off};
} // makeShadower

// Capturing
// ---------

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

// Computed upwardable
// -------------------

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

export {
  U,
  computedUpwardable,
  isUpwardable,
  upwardCapture,
  upwardablePrototype
};
