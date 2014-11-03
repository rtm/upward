// Upward-capable current date/time.
// =================================

import {Upwardable, upward}        from './Upw';
import {valueizeObject, mapObject} from './Obj';
import {observeObjectNow}          from './Obs';

// Date is updated every `tick` ms.
export default function(tick = 1000) {
  var result = Upwardable(0);
  setInterval(_ => result.val = Date(),  tick);
  return result;
}
