// Computable
// ==========

// The **computable** is one of the two key components of the upward library,
// along with the **upwardable**.
// A **computable** is an enhanced function which recomputes itself
// when its inputs or dependencies change.
// Inovking a computable results in a **computed**, which holds the value.
// A computed is always an object; if primitive, it is wrapped.

// Convenience.
var {getNotifier, observe, unobserve, defineProperty} = Object;

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
  return constructComputable(generateCallForever(f), options);
}

function constructComputable(f, options) {
  var computable = getComputable(f);
  if (!computable) {
    computable = createComputable(f, options);
    addComputable(f, computable);
  }
  return computable;
}

// Create a computable function based on a generator.
function createComputable(generator, options = {}) {

  function computable(...args) {
    
    // Resolve the promise which will trigger recomputation.
    function rerunner() { rerun(); }
    
    function iterate() {
      var changed = new Promise(resolve => rerun = resolve);

      stopWatching();
      startCapturing(accesses);

      Promise.resolve(iterator.next().value)
        .then(function(value) {
          // handle value
          stopCapturing();
          startWatching(accesses, rerunner);
          changed.then(iterate);
        })
      ;
    }

    var computed;

    var iterator = generator(rerunner);
    var rerun;

    // `accesses` is a map indexed by object,
    // containing "access" entries with values of `{names: [], observer}`.
    // `names` of null means to watch properties of any name.
    // It is built by calls to `notifyAccess`, invoked through `accessNotifier`.
    var accesses = new Map();
  
    observeArgs(args, rerunner);
    iterate();
  }

  return computable;
)

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
}

function startWatching() {
  accesses.forEach(({observer}) => observer.observe(['update', 'add', 'delete']));
}

function stopWatching(accesses) {
  // Stop observing changes to accesses. Prepare to capture new accesses.
  accesses.forEach(({observer}) => observer.unobserve());
}

function startCapturing(accesses) {
  accesses.clear();
  accessNotifier.push(notifyAccess);
}

function stopCapturing() {
  accessNotifier.pop();
}

function setValue(value) {
  // Objects remain themselves, but primitives become new objects.
  // Upwardables who are watching this computed need to know.
  if (newComputed !== computed) {
    const type = 'compute';
    //        notifier.notify({object: computed, newValue: newComputed, type});
    if (computed) {
      Object.getNotifier(computed).notify({object: computed, newValue: newComputed, type});
    }
    computed = newComputed;
    defineProperty(computed, 'id', { value: computedId++ });
  }
  
  addComputed(computed);
}

    
// Observe changes to arguments.
// This will handle 'compute' changes, and trigger recomputation of function.
// If the argument changes, the new argument is reobserved.
function observeArgs(args, changed) {

  function observeArg(arg, i, args) {
    var observer = Observer(
      arg,
      function argObserver(changes) {
        changes.forEach(({type, newValue}) => {
          if (type === 'compute') {
            args[i] = newValue;
            observer.reobserve(newValue);
          }
        });
        changed();
      },
      //        ['compute', 'delete', 'update', 'add'] // @TODO: check all these are necessary
      ['compute'] // @TODO: check all these are necessary
    );
    observer.observe();
  }
  args.forEach(observeArg);
}

// The ur-computable is to get a property from an object.
var getComputedProperty = C(
  function getProperty(object, name) {
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
