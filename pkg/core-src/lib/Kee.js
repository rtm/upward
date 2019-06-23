// Keepify--make functions which maintain their value.

var {observe, defineProperties} = Object;

import C                            from './Fun';
import {valueize, copyOnto, copyOf} from './Obj';
import {upwardablePrototype}        from './Upw';

// var join   = keepify(function(d)        { return this.join(d);      });
// var max    = keepify(function()         { return Math.max(...this); });
// var min    = keepify(function()         { return Math.min(...this); });
// var mean   = keepify(function()         { return sum(...this);      });
// var length = keepify(function()         { return this.length;       });
// var keys   = keepify(function()         { return Object.keys(this); });
// var some   = keepify(function(f)        { return this.some(f);      });
// var every  = keepify(function(f)        { return this.every(f);     });
// var sort   = keepify(function(f)        { return this.sort(f);      });
// var rev    = keepify(function(b)        { return b ? this.reverse() : this; });
// var slice  = keepify(function(from, to) { return this.slice(from, to); });
// var push   = keepify(function(...args)  { this.push(...args); return this; });
// var concat = keepify(function(...args)  { return this.concat(...args); });

var log = C(function(...args) {
  console.log("LOG:", this, ...args);
});

defineProperties(upwardablePrototype, {
//  join: { value: join },
  log:  { value: log  }
});

export {log};
