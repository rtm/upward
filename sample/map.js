import {U, T, E} from '../src/Up';
var dom, arr;

//===START
arr = [1, 2, 3];
function add() { arr . push(Math . floor (Math . random() * 10)) }

dom = E('div') . has(
  [
    E('div') . has(
      arr . as(
        val => E('div') . has(T(val))
      )
    ),
    E('button') . has(T("Add")) . does({click: add})
  ]
);
//===END

export default dom;
