import {U, T, E} from '../src/Up';
var dom, arr;

//===START
arr = [3, 2, 1];
function random() { return Math . floor (Math . random() * 10); }
function add()    { arr . push(random()); }

dom = E('div') . has( [
  E('div') . has(
    arr .
      by(Number) . 
      as(val => E('div') . has(T(val)))
  ),
  E('button') . has(T("Add")) . does({click: add})
] );
//===END

export default dom;
