// Array methods for maintaining maps, filters, etc.
// Place prototypes on Array and Upwardable objects.
import {mapObject}  from './Obj';
import {upwardablePrototype} from './Upw';
import keepReversed from './Rev';
import keepUnique   from './Unq';
import keepFiltered from './Fil';
import keepMapped   from './Map';
import keepSorted   from './Srt';
import keepSliced   from './Slc';

var {defineProperty, defineProperties} = Object;

// Order an array and keep it ordered as things change.
function keepOrdered(a, order) { 
  return keepMapped(order, i => a[i]); 
}

// Place the methods on the Array and Upwardable prototype.
var methodMap = {
  as: keepMapped,
  by: keepSorted,
  if: keepFiltered,
  of: keepSliced,
  up: keepReversed,
  uniq: keepUnique
};

var arrayProtoMunged = "__UPWARD_METHODS";

var methodDescriptors = mapObject(methodMap, v => ({
  value(...args) { return v(this, ...args); }})
);

if (!Array.prototype[arrayProtoMunged]) {
  [
    Array.prototype,
    upwardablePrototype
  ]
    .forEach(
      proto => defineProperties(proto, methodDescriptors)
    )
  ;
  defineProperty(Array.prototype, arrayProtoMunged, {value: true});
}
