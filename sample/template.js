import {T, F, UpCount} from '../src/Up';
var dom;

//===START
dom = T(F`There have been ${UpCount()} ticks so far.`);
//===END

export default dom;
