// Counter as computable.
// ======================

import {constructComputable} from './Com';

// Counts up by one every `tick` ms.
var COUNT = constructComputable(
  function *(rerun) {
    var timer;
    var start = 0;
    while (true) {
      let [tick] = yield start++;
      tick = tick || 1000;
      clearTimeout(timer);
      timer = setTimeout(rerun, tick);
    }
  }
);                          

export default COUNT;
