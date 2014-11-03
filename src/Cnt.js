// Upward-capable counter.
// =======================

import {Upwardable, upward}        from './Upw';
import {valueizeObject, mapObject} from './Obj';
import {observeObjectNow}          from './Obs';

// Counter is provided `tick` and `start` parameters.
// It counts up by one every `tick` ms, starting at `start`.
// Changing `start` resets it to that value.
function keepCounting(params) {
  
  // Observer watches `start` to reset counter.
  // `end` is also called when `tick` changes.
  function makeParamsObserver() {
    function add_start() {
      var {start} = params;
      result.val = start;
    }
    
    // Protect against ridiculous values of `tick`.
    function add_tick() {
      var {tick} = params;
      params.tick = tick < 0 ? 0 : tick > 0 ? Math.max(tick, 1000/16) : tick;
    }

    return makeObserver({
      add_start,  update_start: add_start,
      add_tick,   update_tick:  add_tick,
      end
    });
  }

  // Run the timer.
  function end() {
    var {tick, dir} = params;
    clearTimeout(timer);
    if (tick) timer = setTimeout(_ => (result += dir, end()), tick);
  }
  
  var timer;
  var result = Upwardable(0);

  // @TODO: replace below with boilerplate
  mapObject(params, (v, k) => upward(v, vv => params[k] = vv));
  params = valueizeObject(params);
  paramsObserver = makeParamsObserver();
  observeObjectNow(params, paramsObserver);

  return result;
}

export default function keepCounting(tick = 1000, start = 0, dir = +1) {
  return _keepCounting({tick, start});
}
