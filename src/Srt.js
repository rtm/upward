// keepSorted (`Array#by): Keep an array in sorted order.
// ======================================================

// Setup.
import {makeSortfunc}            from './Utl';
import {upward, upwardCapture}   from './Upw';
import {valueOf}                 from './Obj';
import {noop, identity}          from './Fun';
import keepMapped                from './Map';

// Order an array based on a map, and keep it updated as map changes.
export function keepOrdered(a, map) { 
  return keepMapped(map, i => a[i]); 
}

// Sort an array based on a key function, and keep it sorted.
export default function keepSorted(a, key = identity) {
  var result = [];
  var params = {};
  var sortfunc;

  // Handle changes to parameters.
  // -----------------------------
  function paramChanged(v, i, params, change) {
    switch (i) {
    case 'a':
      let old = change.oldValue;
      if (old) {
        unobseveObject(old, observer);
      }
      observeObject(v, observer);
      break;
    case 'key':
      sortfunc = makeSortfunc(v);
      break;
    }
  }
  
  // Redo the sort.
  function go() {
    copyOnto(a, result).sort(sortfunc);
  }

  // Watch for changes to parameters.
  var paramHandlers = { add: paramChanged, update: paramChanged, end: go };
  observeObject(params, makeObserver(paramHandlers));
                
  // Handle captured upwardables.
  // -----------------------------

  // Maintain list of captures for each element.
  var captures = keepMapped(a, capture);

  function _upward  (u) { upward  (u, go); }
  function _unupward(u) { unupward(u, go); }
  
  var capturesHandlers = {
    delete: (v, i) => unupwardCaptures(i),
    add: (v, i) => upwardCaptures(i),
    update: (v, i) => {
      unupwardCaptures(i);
      upwardCaptures(i);
    }
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

  function add(v) {
    upward(v, go);
  }

  function _delete(v, i, change) {
    unupward(change.oldValue, go);
  }

  function update(v, i, change) {
    upupward(change.oldValue, go);
    upward(v, go);
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
    update: update,
    add:    add,
    delete: _delete,
    end:    go
  };
  observeObject(a, makeObserver(handlers));

  // Watch for upward changes to parameters.
  upward(a,        a   => params.a   = a  );
  upward(key,      key => params.key = key);

  // Initialize params, which kicks off computation.
  params.a   = valueOf(a);
  params.key = valueOf(key);

  return result;
}
