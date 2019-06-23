// Map.js
// Upward-aware version of Array#map

import {makeUpwardableFunction} from './Fun';
import {copyOntoArray} from './Out';

export default makeUpwardableFunction(function *UpMap(run) {
  var r = [];
  var a, newa;
  var f, newf;
  var ctxt, newctxt;
  var map = new Map();

  function _map(elt) {
    var ret = map.get(Object(elt));
    if (!ret) {
      ret = f.call(ctxt, elt);
      map.set(Object(elt), ret);
    }
    return ret;
  }

  while (true) {
    [newa, newf, newctxt] = yield r;
    if (newf !== f) map.clear();
    a = newa;
    f = newf;
    ctxt = newctxt;
    copyOntoArray(r, a.map(_map));
  }
});
