// Keep an array in sorted order.

import {makeSortfunc}            from './Utl';
import {upward, upwardCapture}   from './Upw';
import {valueOf}                 from './Obj';
import {changeRecordSignaturify, identity} from './Fun';
import keepMapped                from './Map';

// Order an array based on a map, and keep it updated as map changes.
export function keepOrdered(a, map) { 
  return keepMapped(map, i => a[i]); 
}

export default function keepSorted(a, key = identity) {

  var result = [];
  var sortfunc = makeSortfunc(key);

  // Maintain list of captures for each element.
  var captures = keepMapped(a, capture);

  function _upward  (u) { upward  (u, go); }
  function _unupward(u) { unupward(u, go); }
  
  var capturesHandlers = {
    delete: changeRecordSignaturify((v, i) => unupwardCaptures(i)),
    add: changeRecordSignaturify((v, i) => upwardCaptures(i)),
    update: changeRecordSignaturify((v, i) => {
      unupwardCaptures(i);
      upwardCaptures(i);
    })
  };
  Object.observe(captures, capturesHandlers);

  function upwardCaptures(i) {
    captures[i].forEach(_upward);
  }

  function unupwardCaptures(i) {
    captures[i].forEach(_unupward);
  }
  
  function sortCapture() {
    var [, upwardSet] = upwardCapture(sort);
    for (var u in upwardSet) { upward(u, sort); }
  }

  function capture(v) {
    var [, upwardSet] = upwardCapture(_ => key(v));
    return upwwardSet;
  }

  function go() {
    copyArray(a, result).sort(sortfunc);
  }
  
  function sortfuncChanged() {
    sortfunc = makeSortfunc(key);
    go();
  }

  function add(i, v) {
    upward(v, go);
    go();
  }

  function _delete(i, _, oldv) {
    unupward(oldv, go);
    go();
  }

  function update(i, v, oldv) {
    upupward(oldv, go);
    upward(v, go);
    go();
  }

  function upwardAll() {
    a.forEach(v => unupward(v, go));
  }    

  function arrayChanged(_a) {
    a.forEach(v => unupward(v, go));
    a = valueOf(_a);
    go();
  }
  
  // Watch for changes in array values.
  var handlers = {
    update: changeRecordSignaturify(update),
    add:    changeRecordSignaturify(add),
    delete: changeRecordSignaturify(_delete)
  };
  observeObject(a, makeObserver(handlers));

  // Watch for changes to key.
  upward(key, sortfuncChanged);
  upward(a, arrayChanged);
  a = valueOf(a);

  go();
  return result;
}
