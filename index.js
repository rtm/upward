/* jshint esnext: true */

import {RunUpward} from 'app';
import {upwardifyProperties} from 'upward';
import {DIV, TEXT, BUTTON, INPUT} from 'dom';
import {uts} from 'uts';
import 'event';

var data = upwardifyProperties({
  name: "Bob"
});

var obj = upwardifyProperties({ 
  textnode: document.createTextNode("Hello, world."),
  string: uts`Hello, ${data.name}`,
  buttonText: "Press me"
});

var change = function() {
  obj.textnode=document.createTextNode("Hello, upward world.");
	obj.buttonText = "You pressed me";
  obj.string = "shit";
  data.name = "Sakiko";
};
var button = BUTTON()
	.child(TEXT(obj.buttonText))
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


