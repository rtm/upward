// Counter as computable.
// ======================

import {constructComputable} from './Com';

// Counts up by one every `tick` ms.
var COUNT = constructComputable(
  function *(args, rerun) {
    var timer;
    while (true) {
      let [tick] = args;
      tick = tick || 1000;
      clearTimeout(timer);
      timer = setTimeout(return, tick);
      yield start++;
    }
  }
);                          
