// Asynchronous functions
// ======================

// Run values from a generator through promises.
// Return a promise for when everything is done.
function spawn(g, init) {
  var it = g();

  return new Promise(function(resolve) {
    (function iterate(val){
      var {value, done} = it.next(val);
      if (done) { resolve(val); }
      else { Promise.resolve(value).then(iterate); }
    }(init));
  });
    
}

// Return a promise for some time in the future.
function timeout(ms = 0, val) {
  return new Promise(resolve => setTimeout(() => resolve(val), ms));
}

export {
  spawn,
  timeout
};
