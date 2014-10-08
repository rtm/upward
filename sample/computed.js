import {INPUT, TEXT, DIV, C} from '../src/U';
var input = INPUT();
export default DIV()
  .child(input)
  .child(TEXT("multiplied by 2 is:"))
  .child(TEXT(C(_ => input.val_input * 2)));
