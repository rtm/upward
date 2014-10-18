import {E, BUTTON, TEXT} from '../src/U';

var a = [1, 2, 3, 4, 5];
var reverse = () => a.reverse();

export default E([
	BUTTON("Reverse", reverse),
	E(a.as(TEXT))
]);
