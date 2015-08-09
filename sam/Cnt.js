// sam/Cnt.js
// Sample for counting up.

import {UpCount, T} from '../src/Up';

var dom;

///### Counting
///
///We display an auto-updating counter `UpCount()` as a DOM text node (`T`).

//===START
dom = T(UpCount());
//===END

export default dom;
