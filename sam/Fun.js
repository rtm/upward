import {C, T, UpCount} from '../src/Up';
var dom;

/// ### Functions
///
/// It's easy to define upwardable functions. Let's display the square of the timer,
/// using `C` to wrap the function.

//===START
var square = C(x => x*x);

dom = T(square(UpCount()));
//===END

export default dom;
