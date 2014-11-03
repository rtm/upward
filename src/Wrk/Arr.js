function keepify(fn, resultType) {

  return function(...args) {

    function end() { var result = fn.apply(...inputs); }

    // When inputs are initialized or change, tear down and set up observers.
    function add(v, i, o, {oldValue}) {
      if (oldValue  && typeof oldValue === 'object') { observeObject  (oldValue, inputObserver); }
      if (v         && typeof v        === 'object') { unbserveObject (v,        inputObserver); }
    }
  
    var result   = resultType();
    var inputs   = [this, ...args];
    var notifier = inputs.getNotifier();
    var inputObserver = makeObserver({end() { notifier.notify({type: 'modify'}); } });
    
    // Watch for upward changes on inputs and valueize them.
    inputs = inputs.map((v, i) => {
      upward(v, vv => inputs[i] = vv);
      return valueize(v);
    });

    observeObjectNow(inputs, makeObserver({add, update: add, end, modify: end}));
    return result;
  };
}


function COUNTER(delay = 1000, start = 0) {
} 

var join   = keepify(function(d)        { return this.join(d);      });
var max    = keepify(function()         { return Math.max(...this); });
var min    = keepify(function()         { return Math.min(...this); });
var mean   = keepify(function()         { return sum(...this);      });
var length = keepify(function()         { return this.length;       });
var keys   = keepify(function()         { return Object.keys(this); });
var some   = keepify(function(f)        { return this.some(f);      });
var every  = keepify(function(f)        { return this.every(f);     });
var sort   = keepify(function(f)        { return this.sort(f);      });
var rev    = keepify(function(b)        { return b ? this.reverse() : this; });
var slice  = keepify(function(from, to) { return a.slice(from, to); });
var push   = keepify(function(...args)  { return this.push(...args); return this; });
var concat = keepify(function(...args)  { return this.concat(...args); });
