// Keep an array in sorted order.

import {makeSortfunc}          from './Utl';
import {upward, upwardCapture} from './Upw';
import {valueOf}               from './Obj';

export default function keepSorted(a, key = identity, order = true) {

  function sortCapture() {
    var [, upwardSet] = upwardCapture(sort);
    for (var u in upwardSet) { upward(u, sort); }
  }

  function sort() { 
    a.sort(makeSortfunc(valueOf(key), valueOf(order))); 
  }
  
  // Watch for changes in array values.
  // @TODO: check to see if updates/adds are already in correct order
  var handlers = { update: sortRecapture, add: sortRecapture };
  observeObject(filter, makeObserver(handlers));

  sortCapture();

  // Watch for changes to key and order.
  upward(key, sortRecapture);
  upward(order, sort);

  return a;
}
