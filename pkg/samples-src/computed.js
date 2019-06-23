import {BUTTON, INPUT, TEXT, DIV, C, createCSSStyleSheet, insertCSSStyleRules} from 'upward/src/U';
var input = INPUT();

var inputStyles = {backgroundColor: 'yellow'};

insertCSSStyleRules(createCSSStyleSheet(input, true), [
	['input', inputStyles]
]);

export default DIV()
  .child(input)
  .child(TEXT("multiplied by 2 is:"))
  .child(TEXT(C(_ => input.val_input * 2)))
	.child(BUTTON("Change background", () => { inputStyles.backgroundColor = "cyan"; }))
;
