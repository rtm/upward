// Keepmapped: Keep a map of an array up-to-date.
// ==============================================

import U from './Upw';
import C from './Com';

export default function(a, fn = identity) {
  var cache = new WeakMap();

  function f() {
    C.objectNotifier(a);
    return a.map(f);
  }
  
  return C(f);
}
