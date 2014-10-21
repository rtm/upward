// Create a mapped array which is kept in sync via observation.
// Replace changed values, delete deleted values, and mirror splices.

import {upward, upwardCapture}   from './Upw';
import {valueOf}                 from './Obj';
import {changeRecordSignaturify} from './Fun';

var {observe} = Array.prototype;

export default function keepMapped(a, fn, ctxt) {

  var result = [];
  var upwardMaps = [];

  function update(v, i, a) {
    result[i] = fn.call(ctxt, v, i, a);
  }
  
  function _upward  (map) { (map || []).forEach(swapify(upward  )); }
  function _unupward(map) { (map || []).forEach(swapify(unupward)); }
  
  function add(v, i, a) {
    _unupward(upwardMaps[i]);
    var [ret, map] = upwardCapture(() => update(a[i], i, a));
    map.forEach(key => map.set(key, v => update(v, i, a)));
    _upward(upwardMaps[i] = map);
    return result[i] = ret;
  }

  function setup() {
    upwardMaps.forEach(_unupward);
    valueOf(a).forEach(setOne);
  }
  setup();
  
  upward(a, setup);

  var handler = {
    add: changeRecordSignaturify(_add),
    update: changeRecordSignaturify(_update),
    delete({name: i}) {
      _unupward(upwardMaps[i]);
      delete result[i];
    },
    splice({object, index, removed, addedCount}) {
      var added = object.slice(index, index + addedCount).map(fn, ctxt);
      result.splice(index, removed.length, ...added);
    }
  };
  
  observe(a, makeObserver(handler));
  return result;
}
