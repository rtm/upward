import {sum}                   from './Utl';
import keepMapped              from './Map';
import U                       from './Upw';
import {observeObject}         from './Obs';

var {observe} = Array;

// Return a filtered array which is kept up to date.
export default function keepFiltered(a, fn, ctxt) {

  var result = a.filter(fn, ctxt);
  var filter = keepMapped(a, fn, ctxt);

  function capture() {
    var [, upwardSet] = upwardCapture(filter);
    for (var u in upwardSet) { upward(u, filter); }
  }

  function getpos(i) {
    return sum(filter.slice(0, i+1));
  }
  
  var handlers = {
    add({name}) { 
      var val = a[name];
      if (fn.call(ctxt, val, name, a)) { result[name] = val; }
    },
    update({name}) {
      var val = a[name];
      var p = fn.call(ctxt, val, name, a);
      if (p) { a.splice(getpos(name), 0, val); }
      else { a.splice(name, 1); }
    },
    splice({object, index, removed, addedCount}) {
      var added = a.slice(index, index + addedCount).filter(fn, ctxt);
      object.splice(
        getpos(name),
        sum(removed.map(fn, ctxt).map(Boolean)),
          ...added
      );
    }
  };

  // Watch for changes in parallel array of bools.
  observe(filters, makeObserver(handlers));
  
  capture();

  // Watch for changes to filtering criteria.
  upward(fn, capture);
  return result;
}
