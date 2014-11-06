// Upwardable
// ==========

// The heart and soul of the upward library.
// Define An object which remembers its value and can report on changes.

// Convenience.
// No dependencies. Keep it that way.

var {create, keys, assign, getNotifier, freeze, observe, unobserve} = Object;

// Upwardable prototype. Heavily adorned elsewhere with methods.
// Here we just define the `value` property which gets and sets underlying value.
// This permits constructions such as `upwardable.value++`.
var upwardablePrototype = {
  value: {
    get: function() { return capture(this); },
    set: function(v) {
      var old = this.get();
      if (old === v) { return; }
      if (old && typeof old === 'object') tearDownUnderlyingObject(this);
      this.set(v);
      if (v   && typeof v   === 'object') setUpUnderlyingObject   (this);

      // Issue a 'modify' change on the upwardable.
      getNotifier(this).notify({type: 'modify', object: this, oldValue: old});
    },
    enumerable: true
  }
};

// Create a new upwardable.
// This is an ultra-lightweight object wrapping a value with getter and setter.
function createUpwardable(v) {
  console.assert(arguments.length === 1, "createUpwardable() takes exactly one argument.");
  console.assert(!isUpwardable(v), "Cannot create upwardable from upwardable.");

  var u = create(upwardablePrototype, {
    valueOf: { value: _  => u.value },   // get value, with capture handling
    get:     { value: _  => v       },   // get raw value
    set:     { value: nv => v = nv  }    // set raw value
  });

  setUpUnderlyingObject(u);
  return freeze(u);
}

// Constructor for upwardable object.
// Skip construction and return an existing upwardable if one exists.
function U(v) {
  console.assert(arguments.length === 1, "U() takes exactly one argument.");

  return isUpwardable(v) ? v : 
    isUpwardified(v) || createUpwardable(v);
}

function upwardableToString(u) {
  console.assert(isUpwardable(u), "Cannot stringify non-upwardable object.");
  return `U (=${u.get()})`;
}

// Make an observer for the underlying object.
// First, pass add/update/delete changes on it to the upwardable.
// Second, set up and tear down observers on upwardable properties in underlying object.
// Finally, report a 'modify' type change.
function makeUnderlyingObjectObserver(u) {
  console.assert(isUpwardable(u), "Cannot make underlying object observer on non-upwardable.");

  var notifier = getNotifier(u);
  const type = 'modify';

  return changes => {
    changes.forEach(change => {
      var {name, oldValue, object} = change;
      var newValue = object[name];
      if (isUpwardable(oldValue)) unobseveUpwardableProperty(u, oldValue);
      if (isUpwardable(newValue))   obseveUpwardableProperty(u, newValue);
      notifier.notify(change);
    });
    notifier.notify({type}); // should this be on the underlying object?
  };
}

// Set things up so changes to the underlying object are notified on the upwardable.
// Store the observer in a weak map so we can unobserve it when tearing down.
function setUpUnderlyingObject(u) {
  console.assert(isUpwardable(u), "Cannot set up underlying object on non-upwardable.");
  console.assert(isUpwardable(u.get()), "Cannot set up non-object underlying value.");

  let observer = makeUnderlyingObjectObserver(u);
  underlyingObjectObservers.set(u, observer);
  observe(u.get(), observer);
  observeUpwardableProperties(u);
}

// Tear down the previous observer on the underlying object when we get a new one.
function tearDownUnderlyingObject(u) {
  console.assert(isUpwardable(u), "Cannot tear down underlying object on non-upwardable.");
  console.assert(isUpwardable(u.get()), "Cannot tear down non-object Underlying value.");

  let observer = underlyingObjectObservers.get(u);
  console.assert(observer, "Cannot find underlying object observer to tear down.");
  unobserve(valueize(v), observer);
  unobserveUpwardableProperties(u);
}

// Make an observer on an upwardable property in an upwardable's underlying object.
// Used to observe `modify` events and turn them  into `update` events on the object.
function makeUpwardablePropertyObserver(u, p) {
  console.assert(isUpwardable(u), "Cannot make upwardable property observer on non-upwardable object.");
  console.assert(isUpwardable(p), "Cannot make upwardable property observer on non-upwardable property.");

  var notifier = getNotifier(u);
  var notify   = change => notifier.notify({
    type: 'update', name: p, object: u.v, oldValue: change.oldValue
  });
  return changes => changes.forEach(notify);
}

// Observe an upwardable property.
// This is to allow its `modify` events can be reported as `update`s on the object.
// Store the observer, so it can be removed.
function observeUpwardableProperty(u, p) {
  console.assert(isUpwardable(u), "Cannot observe upwardable property on non-upwardable.");
  console.assert(isUpwardable(p), "Cannot observe non-upwardable property.");

  var observer = makeUpwardablePropertyObserver(u, p);
  upwardablePropertyObservers.set({u, p}, observer);
  observe(p, observer, 'modify');
}
  
// Unobserve an upwardable property.
// This would be necessary when the property value changes.
function unobserveUpwardableProperty(u, p) {
  console.assert(isUpwardable(u), "Cannot unobserve upwardable property on non-upwardable.");
  console.assert(isUpwardable(p), "Cannot unobserve non-upwardable property.");

  var observer = upwardablePropertyObservers.get({u, p});
  console.assert(observer, "Cannot find upwardable property observer to unobserve.");

  Object.unobserve(p, observer);
  upwardablePropertyObservers.delete({u, p});
}

// Find upwardable properties in underlying object, observe them.
function observeUpwardableProperties(u) {
  console.assert(isUpwardable(u), "Cannot observe upwardable propertyies on non-upwardable.");

  var v = valueize(u);
  var observe = argify(observeUpwardProperty, u);
  keys(v).map(k => v[k]).filter(isUpwardable).forEach(observe);
}

function unobserveUpwardableProperties(u) {
  console.assert(isUpwardable(u), "Cannot unobserve upwardable propertyies on non-upwardable.");

  var v = valueize(u);
  var unobserve = argify(unobserveUpwardProperty, u);
  keys(v).map(k => v[k]).filter(isUpwardable).forEach(unobserve);
}

function makeUpwardablePropertiesObserver(u) {
  return changes =>
    changes.forEach(change => {
      var {type, name} = change;
      switch (type) {
      case 'update':
      case 'add':    observeUpwardableProperties  (u, name); break;
      case 'delete': unobserveUpwardableProperties(u, name); break;
      }
    })
  ;
}

// Listen for 'modify' events on upwardable properties in an object.
// Pass them along as if the property value itself had changed.
function modifyObserver(changes) {
  changes.forEach(change => {
    if (change.type === 'modify') { this.notifier.notify(change.change); }
  });
}

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

// Lists of upwardables and upwardifieds.
// --------------------------------------

// A list of all upwardables. Used to determine upwardified-ness.
var upwardables = new WeakSet();

// Is something an upwardable?
function isUpwardable(u) {
  return upwardables.has(Object(u));
}

// A list of all objects which have been upwardified.
// Used to prevent creating new upwardifieds on same object.
var upwardifieds = new WeakMap();

// Has something been upwardified?
function isUpwardified(v) {
  return upwardifieds.get(Object(v));
}

// A list of underlying object observers, indexed by upwardable.
var underlyingObjectObservers = new WeakMap();

// A list of observers for upwardable properties in underlying objects.
// Indexed by {upwardable, upwardableProperty}.
// Used to allow us to find and tearn down upwardable property observers.
var upwardablePropertyObservers = new WeakMap();

export {
  U,
  computedUpwardable,
  isUpwardable,
  upwardCapture,
  upwardablePrototype
};
