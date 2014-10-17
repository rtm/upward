// Create a mapped array which is kept in sync via observation.

var observingMapHandler = {
  add    ({name, object}) { result[name] = fn.call(ctxt, object[name]) },
  update({name, object}) { result[name] = fn.call(ctxt, object[name]) },
  delete ({name})         { delete result[name]; }
  splice({object, index, removed, addedCount}) {
    result.splice(
      index, 
      removed.length, 
        ...object.slice(index, index + addedCount).map(fn, ctxt)
    );
  }
};
    
function observingMap(a, fn, ctxt) {
  var result = a.map(fn, ctxt);

  function observer({type, name, object, index, removed, addedCount}) {
    switch(type) {
    case "update": case "add":
      result[name] = fn.call(ctxt, object[name]); 
      break;
    case "delete": 
      delete result[name]; 
      break;
    case "splice":
    }
  }

  Array.observe(a, recs => recs.forEach(observer), ['splice', 'update', 'delete']);
  return result;
}

// Order an array and keep it ordered as things change.
function observingOrder(a, order) {
  return observingMap(order, i => a[i]);
}

// Create an array of running totals, etc.
function runningMap(a, fn, init) {
  return a.map(v => init = fn(v, init));
}

function plus(a,b) { return a + b; }

// Create an array of running totals.
function runningTotal(a) {
  return runningMap(a, plus);
}

// Given a Boolean filter array, keep an array up to date.
function runningFilter(a, filter) {
  var result = a.filter((_, i) => filter[i]);

  function observer({type, name, object, index, oldvalue}) {
    var pos = runningTotal(filter);
    if (object[index]) {
      result.splice(pos, 0, a[index]);
    } else {
      result.splice(pos, 1);
    }
  }

  Object.observe(filter, recs => recs.forEach(observer), ['update']);
  return result;
}

var a = [3,2,1];
function double(x) { return x*2; }

var result = observingMap(a, double);

//a.sort();
delete a[1];
console.dir(a);

setTimeout(function() {
  console.log("result is", result);
}, 500);

export {
  observingMap,
  observingOrder
};
