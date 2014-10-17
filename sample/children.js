import {observingMap} from '../src/Arr';
import {DIV, BUTTON} from '../src/U';
import {createElt} from '../src/Dom';

var a = [1, 2, 3, 4, 5];

function transform(x) {
	return document.createTextNode(x);
}

export default createElt('div', {}, [
	BUTTON("Reverse", function() { a.reverse(); }),
	createElt('div', {}, observingMap(a, transform))
]);
