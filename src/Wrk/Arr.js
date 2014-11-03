function keepifyArrayReducer(fn) {
  return function(a) {
    var u = Upwardable(fn(a));
    return function(params) {
      var result = Upwardable();
      counter.init(result);
      mapObject(params, (v, k) => upward(v, vv => params[k] = vv));
      params = valueizeObject(params);
      params.trigger = 0;
      observeObjectNow(params, Observer);
      return result;
    };
  };
}

function COUNTER(delay = 1000, start = 0) {
}

var JOIN = keepifyArrayReducer(a =>dfsajlkajklf);
var MAX = keepifyArrayReducer(maxArray);
var MIN = keepifyArrayReducer(minArray);
var MEAN = keepifyArrayReducer(meanArray);
var LENGTH = keepifyArrayReducer(a => a.length);



                               

