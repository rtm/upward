// Asynchronous functions
// ======================

// Run values from a generator through promises.
// Return a promise for when everything is done.
function spawn(generator) {
  var iterator = generator();
  
  return new Promise(
    resolve =>
      (function iterate(val) {
        var {value, done} = iterator.next(val);
        if (done) { resolve(val); }
        else { Promise.resolve(value).then(iterate); }
      }())
  );
  
}

// Return a promise for some time in the future,
// passing through the invoking promise's value:
// ```
// Promise.resolve(99).then(timeout(250)) // promise value is 99
// ```
function timeout(ms = 0) {
  return function(val) {
    return new Promise(resolve => setTimeout(_ => resolve(val), ms));
  };
}

export {
  spawn,
  timeout
};
