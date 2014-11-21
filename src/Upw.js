// Upwardable
// ==========

// The **upwardable** is one of the two key components of the upward library,
// along with the **computable**.
// An **upwardable** is an enhanced object which can detect and and act on
// accesses to its properties.

// An upwardable is created by calling `U` on an object.
// `a = U([1, 2, 3])` or `o=U({x: 1, y: 2}` create upwardables.
// A computable detect when `a[0]` or `o.x` is involved,
// and recomputes itself when they changes.
// All accesses to the elements of `a` and `o` continue to function as usual:
// `a[0]`, `a[0] = 1;`, `o.x`, and `o.x = 1`.
// Newly added properties are also immediately observable.

// Convenience.
import {accessNotifier, isComputed} from './Com';
import {valueize} from './Obj';

var {create, keys, assign, getNotifier, observe, unobserve, defineProperty} = Object;
var {set} = Map.prototype;

// A list of all upwardables. Used to determine upwardified-ness.
var upwardables = new WeakSet();

function isUpwardable(u) {
  return upwardables.has(u);
}

// A list of all objects which have been upwardified.
var upwardifieds = new WeakMap();

// Constructor for upwardable object.
function U(v) {
  if (upwardables.has(v)) return v;
  var u = upwardifieds.get(v);
  if (!u) {
    u = createUpwardable(v);
    upwardables.add(u);
    upwardifieds.set(v, u);
  }
  return u;
}

// Upwardable prototype. Heavily adorned elsewhere with methods.
// Give upwardables all array prototype methods.
var upwardablePrototype = Object.create(Array.prototype);

// Create a new upwardable.
function createUpwardable(target) {

  // Remember computed observers by property name, so they can be torn down easily.
  var computedObservers = {};

  // Make an observer for computed properties.
  function makeComputedObserver(name) {
    var observer = Observer(target[name], function(changes) {
      changes.forEach(change => {
        target[name] = change.newValue;
        observeComputable(name);
      });
    });
    computedObservers[name] = observer;
    return observer;
  }

  // Start observing computed properties.
  function observeComputed(name) {
    var computedObserver;
    unobserveComputed(name);
    if (isComputed(target[name])) {
      computedObserver = Observer(target[name], makeComputedObserver(name));
      computedObserver.observe(['modify']);
    }
  }

  // Stop observing computed properties.
  // This includes when its wrapper object changes, or when a property is deleted.
  function unobserveComputed(name) {
    var computedObserver = computedObservers[name];
    if (computedObserver) computedObserver.unobserve();
  }
  
  // Set up a shadow property.
  function upwardifyProperty(name) {

    observeComputed(name);
    
    defineProperty(object, name, {
      set: function(v) {
        var oldValue = target[name];
        const type = 'update';
        if (oldValue === v) return;
        target[name] = v;
        notifier.notify({type, object, name, oldValue});
      },
      get: function()  {
        const type = 'access';
        accessNotifier.notify({type, object, name});
        return valueize(target[name]);
      },
      enumerable: true
    });
  }
  
  // Observer to handle new or deleted properties on the object.
  function objectObserver(changes) {
    changes.forEach(({type, name}) => {
      switch (type) {
      case 'add':    target[name] = object[name]; break;
      case 'delete': delete target[name];         break;
      }
    });
  }

  // Observer to handle new, deleted or updated properties on the target.
  function targetObserver(changes) {
    changes.forEach(({type, name}) => {
      switch (type) {
      case 'add':    upwardifyProperty(name);     break;
      case 'delete':
        unobserveComputable(name);
        delete object[name];
        break;
      case 'update': object[name] = target[name]; break;
      }
    });
  }
    
  var object = create(upwardablePrototype);
  var notifier = getNotifier(object);
  keys(target).forEach(upwardifyProperty);
  observe(target, targetObserver);
  observe(object, objectObserver);
  return object;
}

U.is = isUpwardable;
export default U;
export {
  upwardablePrototype
};
