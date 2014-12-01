import {Up, UpCount, UpText} from '../src/Up';
var dom;

//===START
var UpSquare = Up(x => x * x);
dom = UpText(UpSquare(UpCount()));
//===END

export default dom;
