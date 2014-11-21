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

// Computed prototype. Heavily adorned elsewhere with methods.
var computedPrototype = {
};

function createComputable(f) {

  function computable(...args) {

    // @TODO: observe arguments

    var call = f.bind(this, ...args);
  
    // The accesses map is indexed by object, with values of `{names: [], observer}`.
    // `names` of null means to watch properties of any name.
    // It is built by calls to `observeAccess`, invoked through `accessNotifier`.
    var accesses = new Map();
    
    function observeAccess({object, name}) {
      var accessor = accesses.get(object);
      if (accessor) {
        if (name && accessor.names) accessor.names.push(name);
        else accessor.names = null;
      } else {
        accessor = {
          names: name ? [name] : null,
          observer: Observer(object, function(changes) {
            changes.forEach(({type, name}) => {
              if (!accessor.names ||
                  type === 'update' && accessor.names.indexOf(name) !== -1)
                notifier.notify({type: 'upward'});
            });
          })
        };
        accesses.set(object, accessor);
      }
    }
    
    function run() {
      accessNotifier.notify({type: 'update',  object: c, name: 'value'});
      
      accesses.forEach(({observer}) => observer.unobserve());
      accesses.clear();
      {
        accessNotifier.push(observeAccess);
        {
          c.value = copyOnto(c.value, call());
        }
        accessNotifier.pop();
      }
      // apparently 'configure' change types are reported--why?
      accesses.forEach(({observer}) => observer.observe(['update', 'add', 'delete']));
    }
    
    var c = create(computedPrototype, {
      valueOf: {
        value: function() { return this.value; }
      },
      value: {
        value: undefined,
        enumerable: true,
        writable: true
      }
    });
    
    var notifier = getNotifier(c);
    observe(c, run, ['upward']);
    run();
    
    return c;
  }

  return computable;
}

// `accessNotifier` allows upwardables to report property accesses.
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
