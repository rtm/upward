/* jshint esnext: true */

import {RunUpward} from 'app';
import {upwardifyObject} from 'upward';
import {DIV, TEXT, BUTTON, INPUT} from 'dom';
import 'event';

var obj = upwardifyObject({ 
  textnode: document.createTextNode("Hello, world."),
  string: 'fuck',
  buttonText: 'Press me',
});

var change = function() {
  obj.textnode=document.createTextNode("Hello, upward world.");
	obj.buttonText = "You pressed me";
  obj.string = "shit";
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
    ['body', {backgroundColor: 'cyan'}]
  ]
});

var Run = function(app) {
  var root = document.getElementById(app.root);
  root.appendChild(app.DOM);
  makeStyles(root, app.CSS);
};

Run(app);


