// Counter as computable.
// ======================

import {makeUpwardableFunctionFromGenerator} from './Upf';

// Counts up by one every `tick` ms.
export default makeUpwardableFunctionFromGenerator(
  function *(run) {
    var timer;
    var start = 0;
    while (true) {
      let [tick] = yield start++;
      tick = tick || 1000;
      clearTimeout(timer);
      timer = setTimeout(run, tick);
    }
  }
);
