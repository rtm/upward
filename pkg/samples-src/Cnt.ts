// src/Cnt.ts
// Sample for counting up.

import { Txt, Cnt } from '@upward/core';
import 'rxjs/add/operator/map';

let dom: Text;
const toString = (n: number) => n.toString();

///### Counting
///
///We display an auto-updating counter `Cnt()` as a DOM text node (`Txt`).

//===START
dom = Txt(Cnt().map(toString));
//===END

export default dom;
