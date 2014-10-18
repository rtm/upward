import {observeObject, makeObserver} from '../src/Obs';

var {observe} = Array;
var {keys} = Object;

// Observe an array based on a handlers object.
function observeArray(a, handlers) { return observe(a, handlers, keys(handlers)); }

// Create a mapped array which is kept in sync via observation.
// Replace changed values, delete deleted values, and mirror splices.
function observingMap(a, fn, ctxt) {

  function add({name, object}) { result[name] = fn.call(ctxt, object[name]); }

  var handler = {
    add,
    update: add,
    delete({name}) { delete result[name]; },
    splice({object, index, removed, addedCount}) {
      var added = object.slice(index, index + addedCount).map(fn, ctxt);
      result.splice(index, removed.length, ...added);
    }
  };
    
  var result = a.map(fn, ctxt);
  observe(a, makeObserver(handler));
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

function plus(a, b) { return a + b; }

// Create an array of running totals.
function runningTotal(a) { 
	return runningMap(a, plus); 
}

// Given a Boolean filter array, keep an array up to date.
// When a value changes, splice the element in or out.
function observingFilter(a, filter) {
  var result = a.filter((_, i) => filter[i]);

  var handlers = {
    update({name, object}) {
      var pos = runningTotal(filter);
      if (object[name]) { result.splice(pos, 0, a[name]); }
      else { result.splice(pos, 1); }
		}
  };

  observeObject(filter, makeObserver(handlers));
  return result;
}

// Allow observing map to be applied to array through prototype.
Object.assign(Array.prototype, {
	as(fn) {
		return observingMap(this, fn);
	}
});

export {
  observingMap,
  observingOrder
};
