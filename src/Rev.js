// Keep an array in original, or reversed order.

import {upward}       from './Upw';
import {makeObserver} from './Obs';
import {valueOf}      from './Obj';

export default function keepReversed(a, up) {
  var result = [];

  // Array has changed; switch to new one and recalc.
  function changeArray(_a) {
    Array.unobserve(a, observer);
    a = _a;
    set();
    Array.observe(a, observer);
  }

  // Direction has changed; recalc.
  function changeUp(_up) {
    if (up === _up) { return; }
    up = _up;
    set();
  }
    
  // Calculate corresponding position in possible reversed array.
  function pos(i) {
    return up ? i : a.length - 1 - i;
  }

  // Set the elements in place.
  function set() {
    var len = a.length;
    for (let i = 0; i < len; i++) {
      result[i] = a[pos(i)];
    }
    result.length = len;
  }
  
  // Watch for changes in array or direction.
  upward(up, changeUp);
  upward(a,  changeArray);
  
  var handlers = {
    update({name}) { result[pos(name)] = a[name]; },
    splice ({index, removed, addedCount}) {
      var added = a.slice(index, index + addedCount);
      if (up) {
        result.splice(index, removed.length, ...added);
      } else {
        result.splice(pos(index) - removed.length, removed.length, ...added.reverse());
      }
    }
  };

  a  = valueOf(a);
  up = valueOf(up);

  var observer = makeObserver(handlers);
  set();
  Array.observe(a, observer);
  return result;
}
