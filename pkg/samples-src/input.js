import {E, U, T, F} from 'upward/src/Up';

var dom, input, model;

//===START
model = U({input: ''})
input = E('input') . sets(model.input, true);

dom = E('div') . has([
  input,
  T(F`You input '${model.input}'`)
]);
//===END

export default dom;
