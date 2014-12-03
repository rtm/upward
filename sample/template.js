import {Up, Tx, UpCount} from '../src/Up';
var dom;

//===START
dom = Tx(Up`There have been ${UpCount()} ticks so far.`);
//===END

export default dom;
