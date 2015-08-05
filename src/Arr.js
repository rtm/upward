// Array methods for maintaining maps, filters, etc.
// Place prototypes on Array and Upwardable objects.
//import keepReversed from './Rev';
//import keepUnique   from './Unq';
//import keepFiltered from './Fil';
import UpMap       from './Map';
import {mapObject} from './Out';
import UpSort      from './Srt';
//import keepSliced from './Slc';

var {defineProperty, defineProperties} = Object;
var {prototype} = Array;

// Place the methods on the Array and Upwardable prototype.
var methodMap = {
  as:   UpMap,
  by:   UpSort//,
//  if:   keepFiltered,
//  of:   keepSliced,
//  up:   keepReversed,
//  uniq: keepUnique
};

var arrayProtoMunged = "__UPWARD_METHODS";

var methodDescriptors = mapObject(methodMap, v => ({
  value(...args) { return v(this, ...args); }})
);

if (!prototype[arrayProtoMunged]) {
  defineProperties(prototype, methodDescriptors);
  defineProperty(prototype, arrayProtoMunged, {value: true});
}
