import {INPUT,  TEXT, DIV} from '../src/U';
var input = INPUT();

export default DIV()
  .child(input)
  .child(TEXT("You input:"))
  .child(TEXT(input.val_input));
