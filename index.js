/* jshint esnext: true */

import {RunUpward} from 'app';
import {P, C, V, S} from 'upward';
import {DIV, TEXT, BUTTON, INPUT} from 'dom';
import 'event';

var data = P({
  name: "Bob"
});

var obj = P({ 
  textnode: document.createTextNode("Hello, world."),
  string: S`Hello, ${data.name}`,
  buttonText: "Press me"
});

var change = function() {
  obj.textnode=document.createTextNode("Hello, upward world.");
	obj.buttonText = "You pressed me";
  obj.string = "shit";
  data.name = "Sakiko";
};
var button = BUTTON()
	.child(TEXT(C(_ => obj.buttonText.toUpperCase())))
	.on({click: change});

var input = INPUT();

RunUpward ({
  root: 'app',
  DOM: DIV()
    .child(obj.textnode)
    .child(button)
    .child(TEXT(obj.string))
    .child(input)
    .child(TEXT(input.val_input))
  ,
  CSS: [
    ['body', {backgroundColor: 'wheat'}]
  ]
});


