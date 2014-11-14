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
  // `names` of null means to watch all types of changes.
  // It is built by calls to `observeAccess`, invoked through `accessNotifier`.
  var accesses = new Map();
  
  function observeAccess({object, name}) {
    console.log("observeAccess", object, name);
    var accessor = accesses.get(object);
    if (accessor) {
      if (name && accessor.names) accessor.names.push(name);
      else accessor.names = null;
    } else {
      accessor = {
        names: name ? [name] : null,
        observer: Observer(object, function(changes) {
          changes.forEach(change => {
            console.log("detected change", change);
            if (!accessor.names ||
                change.type === 'update' && accessor.names.indexOf(change.name) !== -1)
              notifier.notify({type: 'upward'});
          });
        })
      };
      accesses.set(object, accessor);
    }
  }
  
  function run() {
    accesses.forEach(({observer}) => observer.unobserve());
    accesses.clear();
    accessNotifier.set(observeAccess);
    f();
    accessNotifier.clear();
    // apparently 'configure' change types are reported--why?
    accesses.forEach(({observer}) => observer.observe(['update', 'add', 'delete']));
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

// `accessNotifier` allows upwardables to report property accesses.
var _accessNotifier;

var accessNotifier = {
  clear:  function()             { _accessNotifier = null; },
  set:    function(notifier)     { _accessNotifier = notifier; },
  notify: function(notification) { 
    if (_accessNotifier) _accessNotifier(notification) ;
  }
};

// `objectAccessNotifier` allows computables to request entire objects be watched.
var _objectAccessNotifier;

var objectAccessNotifier = {
  clear:  function()             { _objectAccessNotifier = null; },
  set:    function(notifier)     { _objectAccessNotifier = notifier; },
  notify: function(notification) { 
    if (_objectAccessNotifier) _objectAccessNotifier(notification) ;
  }
};

export {
  C,
  isComputable,
  computablePrototype,
  accessNotifier
};
