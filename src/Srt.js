// UpSort: upward-aware version of Array#sort
// ==========================================

import {makeUpwardableFunction} from './Fun';
import makeUpwardableObject from './Obj';
import {copyOntoArray} from './Out';
import {makeSortfunc} from './Utl';

export default makeUpwardableFunction(function *UpSort(run) {
  var r = [];

  while (true) {
    var [a, f, desc] = yield r;
    copyOntoArray(r, a.slice().sort(makeSortfunc(f, desc)));
  }
});
