// Upwardable Objects
// ===================

// Upwardable objects are one of the two key components of the upward library,
// along with upwardable functions.
// An **upwardable object** is an enhanced object which can detect and and act on
// accesses to its properties.

// An upwardable object is created by calling `Up` on an object.
// `a = Up([1, 2, 3])` or `o=Up({x: 1, y: 2}` create upwardables.
// All accesses to the elements of `a` and `o` continue to function as usual:
// `a[0]`, `a[0] = 1;`, `o.x`, and `o.x = 1`.
// Newly added properties are also immediately observable.

// Convenience.
import {isUpwardable}          from './Upw';
import {getUpwardableProperty} from './Fun';
import {accessNotifier}        from './Acc';

var {create, keys, getNotifier, observe, unobserve, defineProperty} = Object;

// A list of all upwardables. Used to determine upwardified-ness.
var set = new WeakSet();

function is(u) { return u && typeof u === 'object' && set.has(u); }

// A list of all objects which have been upwardified.
var upwardifieds = new WeakMap();

function get(o) { return o && typeof o === 'object' && upwardifieds.get(o); }

// Constructor for upwardable object.
// Default export from this module, often imported as makeUpwardableObject.
function make(o) {
  if (is(o)) return o;
  var u = get(o);
  if (!u) {
    u = _make(o);
    set.add(u);
    upwardifieds.set(o, u);
  }
  return u;
}

// Create a "property observer", which creates and installs
// observers for upwardable properties.
function makePropObservers(o) {

  // Remember observers by name, so they can be torn down easily.
  var observers = {};
  
  // Make an observer for an upwardable property.
  function make(name) {
    var observer = Observer(o[name], function(changes) {
      changes.forEach(change => {
        o[name] = change.newValue;
        observe(name);
      });
    });
    return (observers[name] = observer);
  }

  // Stop observing upwardable properties.
  // This includes when its wrapper object changes, or when a property is deleted.
  function unobserve(name) {
    var observer = observers[name];
    if (observer) observer.unobserve();
  }

  // Start observing an upwardable property.
  return function observe(name) {

    unobserve(name);
    if (name in o && isUpwardable(o[name])) {
      observers[name] = Observer(o[name], make(name)).observe(['upward']);
    }
  };

}

// Create a new upwardable object.
function _make(o) {

  var propObserver = makePropObservers(o);
    
  // Set up a shadow property.
  function upwardifyProperty(name) {
    
    propObserver(name);
    
    defineProperty(object, name, {
      set: function(v) {
        var oldValue = o[name];
        const type = 'update';
        if (oldValue === v) return;
        target[name] = v;
        notifier.notify({type, object: u, name, oldValue});
      },
      get: function()  {
        const type = 'access';
        accessNotifier.notify({type, object: u, name});
        return getComputedProperty(o, name);
      },
      enumerable: true
    });
  }
  
  // Observer to handle new or deleted properties on the object.
  function objectObserver(changes) {
    changes.forEach(({type, name}) => {
      switch (type) {
      case 'add':    o[name] = u[name]; break;
      case 'delete': delete o[name];    break;
      }
    });
  }

  // Observer to handle new, deleted or updated properties on the target.
  function targetObserver(changes) {
    changes.forEach(({type, name}) => {
      switch (type) {
      case 'add':    upwardifyProperty(name); break;
      case 'delete':
        propObserver(name);
        delete u[name];
        break;
      case 'update': u[name] = o[name]; break;
      }

      // In case someone is watching the upwardable, pass through changes on target.
      notifier.notify(change);
    });
  }
    
  var u = create({});
  var notifier = getNotifier(u);
  keys(o).forEach(upwardifyProperty);
  observe(o, targetObserver);
  observe(u, objectObserver);
  return u;
}

export default make;
var isUpwardableObjectd = is;
export {
  isUpwardableObject
};
