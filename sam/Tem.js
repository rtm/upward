import {T, F, UpCount} from '../src/Up';
var dom;

/// ### Templating
///
/// ES6 format strings with the `F` (for **f**ormat) tag are auto-updated.

//===START
dom = T(F`There have been ${UpCount()} ticks so far.`);
//===END

export default dom;
