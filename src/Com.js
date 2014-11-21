// Computable
// ==========

// The **computable** is one of the two key components of the upward library,
// along with the **upwardable**.
// A **computable** is an enhanced function which recomputes itself
// when its inputs change.
// Inovking a computable results in a **computed**, which holds the value.

// Convenience.
var {create, getNotifier, observe, unobserve} = Object;

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

// Constructor for computable.
function C(f) {
  var computable = getComputable(f);
  if (!computable) {
    computable = createComputable(f);
    addComputable(f, computable);
  }
  return computable;
}

function createComputable(f) {

  function computable(...args) {

    var value;
    var observable = {};
    var notifier = getNotifier(observable);
    var call = f.bind(this, ...args);
  
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
              notifier.notify({type: 'upward'});
          });
        });
      }

      // Make a new entry in the access table, containing initial property name if any
      // and observer for properties accessed on the object.
      function makeAccessEntry() {
        return {
          names: name ? [name] : null,
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
    // If value is scalar and changes, then alert upwardables who may be watching.
    function run() {

      if (value) {
        accessNotifier.notify({type: 'update',  object: value});
      }

      // Stop observing changes to accesses. Prepare to capture new accesses.
      accesses.forEach(({observer}) => observer.unobserve());
      accesses.clear();
      accessNotifier.push(notifyAccess);

      var newValue = Object(copyOnto(value, call()));

      accessNotifier.pop();

      // Objects remain themselves, but scalars become new objects.
      // Upwardables who are watching this computation need to know.
      if (newValue !== value) {
        notifier.notify({object: value, newValue, type: 'modify'});
        value = newValue;
      }

      // Observe changes to newly-captured accesses.
      // @TODO: apparently 'configure' change types are reported--why?
      accesses.forEach(({observer}) => observer.observe(['update', 'add', 'delete']));
    }
    
    observe(observable, run, ['upward']);
    run();
    
    return value;
  }

  return computable;
}

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

C.objectNotifier = objectNotifier;
C.is = isComputable;
export default C;
export {
  isComputable,
  accessNotifier,
  objectNotifier,
  isComputed,
  computedPrototype
};
