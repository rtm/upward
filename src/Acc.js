// AccessController
// ================

// Capture and watch accesses to properties made during computations.

// Convenience.
var {observe, unobserve} = Object;

import {Observer} from './Obs';

// AccessNotifier
// --------------

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

// makeAccessController
// --------------------

// Make an access controller, allowing accesses to be captured and observed.
function makeAccessController(rerun) {
  // `accesses` is a map indexed by object,
  // containing "access" entries with values of `{names: [], observer}`.
  // `names` of null means to watch properties of any name.
  // It is built by calls to `notifyAccess`, invoked through `accessNotifier`.
  var accesses = new Map();

  function unobserve() {
    accesses.forEach(({observer}) => observer.unobserve());
  }

  function observe() {
    accesses.forEach(({observer}) => observer.observe(['update', 'add', 'delete']));
  }

  // Start capturing accessed dependencies.
  function capture() {
    accesses.clear();
    accessNotifier.push(notifyAccess);
  }

  // Stop capturing accessed dependencies.
  function uncapture() {
    accessNotifier.pop();
  }

  function start() {
    unobserve();
    capture();
  }

  function stop() {
    uncapture();
    observe();
  }

  // `notifyAccess` is the callback invoked by upwardables when a property is accessed.
  // It records the access in the `accesses` map.
  function notifyAccess({object, name}) {

    // Create an observer for changes in properties accessed during execution of this function.
    function makeAccessedObserver() {
      return Observer(object, function(changes) {
        changes.forEach(({type, name}) => {
          var {names} = accessEntry;
          if (!names || type === 'update' && names.indexOf(name) !== -1)
            rerun();
        });
      });
    }

    // Make a new entry in the access table, containing initial property name if any
    // and observer for properties accessed on the object.
    function makeAccessEntry() {
      accesses.set(object, {
        names:    name ? [name] : null,
        observer: makeAccessedObserver()
      });
    }

    // If properties on this object are already being watched, there is already an entry
    // in the access table for it. Add a new property name to the existing entry.
    function setAccessEntry() {
      if (name && accessEntry.names) accessEntry.names.push(name);
      else accessEntry.names = null;
    }

    var accessEntry = accesses.get(object);
    if (accessEntry) setAccessEntry();
    else makeAccessEntry();
  }

  return {start, stop};
}

export {
  makeAccessController,
  accessNotifier
};
