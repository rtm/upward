import {Up, UpCount, UpText} from '../src/Up';
var dom;

//===START
dom = UpText(Up`There have been ${UpCount()} ticks so far.`);
//===END

export default dom;