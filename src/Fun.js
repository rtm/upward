// Upwardable Functions
// ====================

// The **upwardable function** is one of the two key components of the upward library,
// along with the **upwardable object**.
// An **upwardable function** is an enhanced function which recomputes itself
// when its inputs or dependencies change.
// Inovking an upwardable function results in a **upwardable**, which holds the value.
// An upwardable is always an object; if primitive, it is wrapped.

// Convenience.
var {getNotifier, observe, unobserve, defineProperty} = Object;

import {makeAccessController} from './Acc';
import {generateForever}      from './Asy';
import {Observer}             from './Obs';
import {copyOnto, isObject}   from './Out';
import makeUpwardable         from './Upw';

// Keep track of computables, computeds, and computifieds.
var set = new WeakSet();
var generators = new WeakMap();

function is (f)    { return set.has(f); }
function get(g)    { return g && typeof g === 'object' && generators.get(g); }
function add(f, g) { set.add(f); generators.set(g, f); }

// Convenience constructor for computable when on simple function.
// To provide your own generator, use `constructComputable`.
// This is the default export from this module.
function C(f, init) {
  return make(generateForever(f, init));
}

// Construct upwardable function from generator (if not already constructed).
function make(g) {
  var f = get(g);
  if (!f) {
    f  = _make(g);
    add(f, g);
  }
  return f;
}

// Create an upwardable function based on a generator.
// The generator must provide the following behavior.
// The first `iterator.next()` is invoked synchronously, and must yield a neutral, default, safe value.
// Following `iterator.next()` calls are passed function arguments as an array.
// In other words, `yield` statements should be written as `args = yield x;`,
// where `args` will be/should be/might be used in deriving the next value to yield.
// The yielded value may be (but not need be) be a promise to be waited for.
function _make(g) {

  function f(...args) {

    // Resolve the promise which will trigger recomputation.
    function run()         { runner(); }
    function accessStart() { accessController.start(); }
    function accessStop()  { accessController.stop(); }

    function iterate() {
      var change = new Promise(resolve => runner = resolve);
      function reiterate() { change.then(iterate); }

      accessStart();
      var {done, value} = iterator.next(args);
      console.assert(!done, "Iterator underlying computable ran out of gas.");

      var promise = Promise.resolve(value);
      promise.then(accessStop, accessStop); // should this be synchronous?
      promise
        .then(
          newValue => result = result.change(newValue),
          reason => { console.log(reason); }
        )
        .then(reiterate);
    }

    var iterator = g(run);
    var result = makeUpwardable(iterator.next().value);
    var accessController = makeAccessController(run);
    var runner;

//    if (computed) {
//      accessNotifier.notify({type: 'update',  object: computed});
//    }

    observeArgs(args, run);
    iterate();
    return result;
  }

  return f;
}

// Observe changes to arguments.
// This will handle 'compute' changes, and trigger recomputation of function.
// When args changes, the new value is reobserved.
function observeArgs(args, run) {

  function observeArg(arg, i, args) {
    var observer = Observer(
      arg,
      function argObserver(changes) {
        changes.forEach(({type, newValue}) => {
          if (type === 'upward') {
            args[i] = newValue;
            observer.reobserve(newValue);
          }
        });

        run();
      },
      // @TODO: consider whether to check for D/A/U here, or use 'modify' change type
      ['upward', 'delete', 'add', 'update'] // @TODO: check all these are necessary
    );
    observer.observe();
  }

  args.forEach(observeArg);
}

// The ur-upwardable function is to get a property from an object.
// This version does not support upwardables as arguments.
var getUpwardableProperty = C(
  function getProperty([object, name], run) {
    observe(object, changes => changes.forEach(change => {
      if (change.name === name) run();
    }));
    return object[name];
  }
);

var makeUpwardableFunction = make;

C.is = is;
export default C;

export {
  makeUpwardableFunction,
  getUpwardableProperty
};
