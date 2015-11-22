// Counter as computable.
// ======================

import makeUpwardableFunction from './Upf';

// Counts up by one every `tick` ms.
// This implementation uses the "context" variety of upwardable function,
// since it needs to keep track of the current count and timer across invocations.
var Counter = makeUpwardableFunction(

  function(context) {

    return function(tick = 1000, start = 0, step = 1) {

      // Retain previous start if start is missing or null.
      start = start || context.start || 0;

      function set() {
        clearTimeout(context.timer);
        context.timer = setTimeout(run, tick);
      }

      function run() {
        context.change(context.start);
        context.start += step;
        set();
      }

      context.start = start;
      set();
      return start;
    };
  },

  {context: true}

);

export default Counter;

import makeUpwardableValue from './Upv';
if (false) {
  var v = makeUpwardableValue(2);
  var x = Counter(1000, null, v);
  console.log(+x);
  x.observe(v => console.log(+v));
  setTimeout(() => v.change(5), 5000);
}
