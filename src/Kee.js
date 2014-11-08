// Keepify--make functions which maintain their value.

var {observe, defineProperties} = Object;

import {upwardablePrototype} from './Upw';
import {valueize, copyOnto, copyOf} from './Obj';
import {makeObserver} from './Obs';
import {U} from './Upw';

function keepify(fn) {
  return function(...args) {
    
    function compute() {
      return fn.apply(
          ...valueize(inputs)
          .map(valueize)
          .map(copyOf)
      );
    }

    function upward() {
      copyOnto(valueize(result), compute());
      // issue upward event?
    }
    
    var inputs = U([this, ...args]);
    var result = U(compute());
    
    // call the fn now and see what the type of result is.
    // Also, do capturing here.
    
    observe(inputs, makeObserver({upward}));
 
    return result;
  };
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
var slice  = keepify(function(from, to) { return this.slice(from, to); });
var push   = keepify(function(...args)  { this.push(...args); return this; });
var concat = keepify(function(...args)  { return this.concat(...args); });
var log    = keepify(function(...args)  { console.log("LOG:", this, ...args); return this; });

defineProperties(upwardablePrototype, {
  join: { value: join },
  log:  { value: log  }
});

