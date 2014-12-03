import {El, Tx, Up} from '../src/Up';

var dom, input;

//===START
input = El('input');

dom = El('div')
  .has([
    input,
    Txt(Up`You input '${input.input}'`)
  ])
;
//===END

export default dom;
