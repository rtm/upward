import {C, T, UpCount} from '../src/Up';
var dom;

//===START
var square = C(x => x * x);
dom = T(square(UpCount()));
//===END

export default dom;
