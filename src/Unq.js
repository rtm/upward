// Maintain an array in unique state.

import {filterInPlace} from './Utl';
import {observeObject, makeObserver} from './Obs';

export default function keepUnique(a) {
  function isUnique(elt, i, a) { return !i || a.lastIndexOf(elt, i-1) === -1; }
  function check({name: i})    { if (i !== 'length' && !isUnique(a[i])) { a.splice(i, 1); } }

  var handlers = { update: check, add: check };

  filterInPlace(a, isUnique);
  observeObject(a, makeObserver(handlers));
  return a;
}
