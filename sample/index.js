import {RunUpward} from '../src/App';
import {P, C, V, S, DIV, TEXT, BUTTON, INPUT} from '../src/U';

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
	.events({click: change});

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
//    ['body', {backgroundColor: 'wheat'}]
  ]
});


