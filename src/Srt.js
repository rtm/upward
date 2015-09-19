// UpSort: upward-aware version of Array#sort
// ==========================================

import {makeUpwardableFunctionFromGenerator} from './Upf';
import makeUpwardableObject from './Upo';
import {copyOntoArray} from './Obj';
import {makeSortfunc} from './Utl';

export default makeUpwardableFunctionFromGenerator(function *UpSort(run) {
  var r = [];

  while (true) {
    var [a, f, desc] = yield r;
    copyOntoArray(r, a.slice().sort(makeSortfunc(f, desc)));
  }
});
