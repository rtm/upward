// Upward-capable current date/time.
// =================================

import U from './Upw';
import C from './Com';

// Date is updated every `tick` ms.
export default function(tick = 1000) {
  var result = Upwardable(0);
  setInterval(_ => result.val = Date(),  tick);
  return result;
}
