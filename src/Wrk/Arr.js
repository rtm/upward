function keepify(fn, resultType) {

  return function(...args) {

    function compute  { return fn.apply(...inputs.map(valueize)); }
    function modify() { result = compute(); }

    var result = compute();
    var inputs = U([this, ...args]);

    // call the fn now and see what the type of result is.
    // Also, do capturing here.
    
    observeObject(inputs, makeObserver({modify}));
 
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
