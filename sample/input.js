import {E, T, F} from '../src/Up';

var dom, input;

//===START
input = E('input');

dom = E('div')
  .has([
    input,
    T(F`You input '${input.input}'`)
  ])
;
//===END

export default dom;
