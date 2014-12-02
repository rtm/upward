import {UpElement, Up, UpText} from '../src/Up';

var dom, input;

//===START
input = UpElement('input');

dom = UpElement('div', [
  input,
  UpText(Up`You input '${input.input}'`)
]);
//===END

export default dom;
