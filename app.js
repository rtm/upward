/* jshint esnext: true */

import {createUpwardableObject, DIV, TEXT, BUTTON, INPUT} from 'upward';

var obj = createUpwardableObject({ 
	textnode: document.createTextNode("Hello, world."),
	string: 'fuck',
	buttonText: 'Press me',
});


var button = BUTTON().child(TEXT(obj.buttonText));
var change = function() {
	obj.textnode=document.createTextNode("Hello, upward world.");
	obj.string = "shit";
};
button.addEventListener('click', change);

var input = INPUT();

var app = {
	root: 'app',
	DOM: DIV()
//		.child(obj.textnode)
		.child(button)
		.child(TEXT(obj.string))
		.child(input)
		.child(TEXT(input.val))
	,
	CSS: [],
	listeners: {}
};

var Run = function(app) {
	document.getElementById(app.root).appendChild(app.DOM);
};

Run(app);


