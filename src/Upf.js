// Upwardable Functions
// ====================

// The **upwardable function** is one of the three key components of the upward library,
// along with the **upwardable value** and **upwardable object**.
// An **upwardable function** is an enhanced function which recomputes itself
// when its inputs or dependencies change.
// Inovking an upwardable function results in a **upwardable value**.
//
// Options:
//   raw:     Arguments are passed directly to underlying function, without dereferencing.
//            Useful if function intends to call other upwardable functions with these arguments.
//   async:   Underlying function is re-executed on next tick.
//            Useful if it is desired to delay re-execution after multiple changes.
//   context: Underlying function takes a `context` argument.
//            Calling it with this context argument should return the function upwardize.
//            Useful if function needs to maintain state across executions.

import {makeAccessController} from './Acc';
import makeUpwardableValue, {isUpwardableValue, getUpwardableValue} from './Upv';


// Create an upwardable function based on an underlying function.
export default function(fn, options = {}) {

  function f(...args) {

    function accessStart() { accessController.start(); }
    function accessStop()  { accessController.stop(); }

    // Run the function and report the reulst.
    function run() {
      result.change(evaluate());
      scheduled = false;
    }

    // Re-evaulate the underlying function.
    function evaluate() {
      var call = options.context ? fn(context) : fn;
      return call(...args.map(options.raw ? x => x : getUpwardableValue));
    }

    // Schedule a re-execution (or do it right way if not async).
    function schedule()  {
      if (!options.async) run();
      else if (!scheduled) setTimeout(run);
      scheduled = true;
    }

    // Observe changes to arguments and trigger recomputation of function.
    function observe(arg, i) {
      if (!isUpwardableValue(arg)) return;
      arg.observe(newv => { args[i] = newv; schedule(); });
    }

    var scheduled;
    var context = {change: v => result.change(v)};
    var accessController = makeAccessController();
    var result = makeUpwardableValue(evaluate());

    args.forEach(observe);

    return result;
  }

  return f;
}
