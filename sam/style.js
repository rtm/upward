import {E, U, T} from '../src/Up';
var dom;

//===START
var style = U({ backgroundColor: 'pink' });
function click() { style.backgroundColor = 'cyan'; }

dom = E('button') .
  is({ style }) .
  does({ click }) .
  has(T("Change my background"));
//===END

export default dom;
