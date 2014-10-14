import {INPUT, TEXT, DIV, C, createCSSStyleSheet, insertCSSStyleRules} from '../src/U';
var input = INPUT();

insertCSSStyleRules(createCSSStyleSheet(input, true), [
	['input', {color: 'purple'}]
]);

export default DIV()
  .child(input)
  .child(TEXT("multiplied by 2 is:"))
  .child(TEXT(C(_ => input.val_input * 2)));
