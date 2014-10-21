import {P, E, BUTTON, TEXT, V} from '../src/U';

var a = [1, 2, 3, 4, 5];

var reverse = () => {
  model.order = !V(model.order);
  setTimeout(function() {console.log(r);}, 200);
};

var insert = () => {
  a.splice(1, 0, 1.5);
  setTimeout(function() {console.log(r);}, 200);
};

export default E([
	BUTTON("Reverse", reverse),
	BUTTON("Insert", insert),
//	E(a.as(TEXT))
]);

var model = P({order: true});

var map = x => x*x;
var r = a.up(model.order);
