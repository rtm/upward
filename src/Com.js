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

import {Observer}             from './Obs';
import {copyOnto, isObject}   from './Obj';
import {generateForever}      from './Asy';
import {makeAccessController} from './Acc';

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

// Convenience constructor for computable when on simple function.
// To provide your own generator, use `constructComputable`.
function C(f, options) {
  return constructComputable(generateForever(f), options);
}

// Construct computable from generator (if not already constructed).
function constructComputable(generator, options) {
  var computable = getComputable(generator);
  if (!computable) {
    computable = createComputable(generator, options);
    addComputable(generator, computable);
  }
  return computable;
}

// Create a computable function based on a generator.
function createComputable(generator, options = {}) {

  function computable(...args) {
    
    // Resolve the promise which will trigger recomputation.
    function rerunner() { rerun(); }
    
    function iterate() {
      // Make a promise the resolution of which will trigger rerunning the function.
      var changed = new Promise(resolve => rerun = resolve);

      accessController.start();
      var {done, value} = iterator.next(args);
      console.assert(!done, "Iterator underlying computable ran out of gas.");
      Promise.resolve(value)
        .then(function(newComputed) {
          newComputed = Object(newComputed);
          if (newComputed !== computed) {
            const type = 'compute';
            if (computed) {
              Object.getNotifier(computed).notify({object: computed, newValue: newComputed, type});
            }
            // DO COPYONTO
            computed = newComputed;
            addComputed(computed);
            defineProperty(computed, 'id', { value: computedId++ });
          }            
          accessController.stop();
          changed.then(iterate);
        })
      ;
    }

    var iterator = generator(rerunner);
    var computed = Object(iterator.next().value);
    addComputed(computed);
    var accessController = makeAccessController(rerunner);
    var rerun;

//    if (computed) {
//      accessNotifier.notify({type: 'update',  object: computed});
//    }

    observeArgs(args, rerunner);
    iterate();
    return computed;
  }

  return computable;
}

// Observe changes to arguments.
// This will handle 'compute' changes, and trigger recomputation of function.
// When args changes, the new value is reobserved.
function observeArgs(args, rerun) {

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
        rerun();
      },
      //        ['compute', 'delete', 'update', 'add'] // @TODO: check all these are necessary
      ['compute'] // @TODO: check all these are necessary
    );
    observer.observe();
  }
  args.forEach(observeArg);
}

// The ur-computable is to get a property from an object.
// This version does not support computeds as arguments.
var getComputedProperty = C(
  function getProperty([object, name], rerun) {
    observe(object, changes => changes.forEach(change => {
      if (change.name === name) rerun();
    }));
    return object[name];
  }
);

export default C;

export {
  constructComputable,
  getComputedProperty,
  isComputable,
  isComputed
};
