// Computable
// ==========

// The **computable** is one of the two key components of the upward library,
// along with the **upwardable**.
// A **computable** is an enhanced function which recomputes itself
// when its inputs change.

// Convenience.
var {create, assign, getNotifier, observe, unobserve, defineProperty} = Object;

import {Observer} from './Obs';

// A set of all computables.
var computables = new WeakSet();

function isComputable(c) {
  return computables.has(c);
}

// A map of all functions which have been made into computables.
var computifieds = new WeakMap();

// Constructor for computable.
function C(f) {
  var c = computifieds.get(f) || createComputable(f);
  computables.add(c);
  computifieds.set(f, c);
  return c;
}

// Computable prototype. Heavily adorned elsewhere with methods.
var computablePrototype = {
  set(v)    { this.value = v; },
  get()     { return this.value; },
  valueOf() { return this.value; }
};

function createComputable(f) {
  
  // The accesses map is indexed by object, with values of `{names: [], observer}`.
  // It is built by calls to `observeAccess`, invoked through `accessNotifier`.
  var accesses = new Map();
  
  function observeAccess({object, name}) {
    var accessor = accesses.get(object);
    if (accessor) {
      accessor.names.push(name);
    } else {
      accessor.observer = Observer(object, function(changes) {
        changes.forEach(change => {
          if (!accessor.names || accessor.names.indexOf(change.name) !== -1) {
            notifier.notify({type: 'upward'});
          }
        });
      }, 'access');
    }
  }
  
  function run() {
    accesses.forEach(({observer}) => observer.unobserve());
    accesses.clear();
    accessNotifier.set(observeAccess);
    f();
    accessNotifier.clear();
    accesses.forEach(({observer}) => observer.observe());
  }

  var c = create(computablePrototype, {
    value: {
      get() {},
      set(v) { },
    },
  });
  var notifier = getNotifier(c);
  observe(c, run, ['upward']);

  run();
  return c;
}

// The `accessNotifier` is exported to allow upwardables to report accesses.
var _accessNotifier;

var accessNotifier = {
  clear:  function()             { _accessNotifier = null; },
  set:    function(notifier)     { _accessNotifier = notifier; },
  notify: function(notification) { _accessNotifier(notification); }
};

export {
  C,
  isComputable,
  computablePrototype,
  accessNotifier
};
