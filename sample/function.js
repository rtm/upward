import {Up, UpCount, UpText} from '../src/Up';
var dom;

//===START
var square = Up(x => x * x);
dom = Tx(square(UpCount()));
//===END

export default dom;
