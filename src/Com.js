// Computable
// ==========

// The **computable** is one of the two key components of the upward library,
// along with the **upwardable**.
// A **computable** is an enhanced function which recomputes itself
// when its inputs or dependencies change.
// Inovking a computable results in a **computed**, which holds the value.
// A computed is always an object; if primitive, it is wrapped.

// Convenience.
var {getNotifier, observe, unobserve} = Object;

import {Observer} from './Obs';
import {copyOnto, isObject} from './Obj';

// Keep track of computables, computeds, and computifieds.
var computables  = new WeakSet();
var computeds    = new WeakSet();
var computifieds = new WeakMap();

function isComputable (c)    { return isObject(c) && computables .has(c); }
function isComputed   (c)    { return isObject(c) && computeds   .has(c); }
function getComputable(f)    { return isObject(f) && computifieds.get(f); }
function addComputable(f, c) { computables.add(c); computifieds.set(f, addComputable); }
function addComputed  (c)    { computeds.add(c); }

var computedId = 0;

// Constructor for computable.
function C(f, options) {
  var computable = getComputable(f);
  if (!computable) {
    computable = createComputable(f, options);
    addComputable(f, computable);
  }
  return computable;
}

var computablePrototype = Object.create(Function, {
});

function createComputable(f, options = {}) {

  function computable(...args) {

    var computed;
    var observable = {};
    var notifier = getNotifier(observable);
  
    // Deal with properties accessed during execution of this function.
    // Maintain an `accesses` map indexed by object,
    // containing "access" entries with values of `{names: [], observer}`.
    // `names` of null means to watch properties of any name.
    // It is built by calls to `notifyAccess`, invoked through `accessNotifier`.
    var accesses = new Map();

    function notifyAccess({object, name}) {

      // Create an observer for changes in properties accessed during execution of this function.
      function makeAccessedObserver() {
        return Observer(object, function(changes) {
          changes.forEach(({type, name}) => {
            var {names} = accessEntry;
            if (!names || type === 'update' && names.indexOf(name) !== -1)
              notifier.notify({type: 'recompute'});
          });
        });
      }

      // Make a new entry in the access table, containing initial property name if any
      // and observer for properties accessed on the object.
      function makeAccessEntry() {
        return {
          names:    name ? [name] : null,
          observer: makeAccessedObserver()
        };
      }

      // If properties on this object are already being watched, there is already an entry
      // in the access table for it. Add a new property name to the existing entry.
      function setAccessEntry() {
        if (name && accessEntry.names) accessEntry.names.push(name);
        else accessEntry.names = null;
      }
      
      var accessEntry = accesses.get(object);
      if (accessEntry) setAccessEntry();
      else accessEntry = makeAccessEntry();
      accesses.set(object, accessEntry);
    }

    // Run the function.
    // Stop observing dependencies, and set up capture of new dependencies.
    // After computation, start observing newly captured dependencies.
    // If computed is scalar and changes, then alert upwardables who may be watching.
    function run() {

      // If this function is running in the context of another computed function,
      // let it know that there has been an access.
      if (computed) {
        accessNotifier.notify({type: 'update',  object: computed});
      }

      // Stop observing changes to accesses. Prepare to capture new accesses.
      accesses.forEach(({observer}) => observer.unobserve());
      accesses.clear();
      accessNotifier.push(notifyAccess);

      var newComputed = Object(f.call({computed, accessNotifier, run}, ...args));

      accessNotifier.pop();

      // Objects remain themselves, but primitives become new objects.
      // Upwardables who are watching this computed need to know.
      if (newComputed !== computed) {
        const type = 'compute';
//        notifier.notify({object: computed, newValue: newComputed, type});
        if (computed) {
          Object.getNotifier(computed).notify({object: computed, newValue: newComputed, type});
        }
        computed = newComputed;
        computed.id = computedId++;
      }

      addComputed(computed);
      
      // Observe changes to newly-captured accesses.
      // @TODO: apparently 'configure' change types are reported--why?
      accesses.forEach(({observer}) => observer.observe(['update', 'add', 'delete']));
    }

    // Make stack traces friendlier.
    run.displayName = `[run '${f.displayName}']`;

    // Observe the arguments and recompute on changes.
    args.forEach(arg => {
      if (isComputed(arg)) {
        observe(arg, changes => {
          notifier.notify({type: 'recompute'});
        }, ['compute', 'delete', 'update', 'add']);
      }
    });
    
    observe(observable, run, ['recompute']);
    run();
    
    return computed;
  }

  return computable;
}

var tmpArg;

// The ur-computable is to get a property from an object.
var getComputedProperty = C(
  function(object, name) {
    observe(object, changes => changes.forEach(change => {
      if (change.name === name) this.run();
    }));
    return object[name];
  }
);

// `accessNotifier` allows upwardables to report property accesses.
// It is a stack to handle nested invocations of computables.
var _accessNotifier = [];

var accessNotifier = {
  pop:  function()               { _accessNotifier.shift(); },
  push: function(notifier)       { _accessNotifier.unshift(notifier); },
  notify: function(notification) {
    if (_accessNotifier.length) _accessNotifier[0](notification) ;
  }
};

// Convenience routine to allow functions to request an entire object be observed.
// This would typically be called from within a computified function.
function objectNotifier(o) {
  accessNotifier.notify({object: o});
}

export default C;

export {
  isComputable,
  accessNotifier,
  isComputed,
  getComputedProperty
};
