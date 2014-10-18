import {observeObject, makeObserver} from '../src/Obs';
import {logify} from '../src/Fun';

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

// Create an array of unique values.
function uniqueize(a) {
  return a.filter((elt, i) => a.indexOf(elt) === i);
}

// Filter an array in place, based on predicate with same signature as `Array#filter`.
function filterInPlace(a, fn, ctxt) {
	for (var i = 0; i < a.length; i++) {
		if (!fn.call(ctxt, a[i], i, a)) {
			a.splice(i--, 1); 
		}
	}
  return a;
}

// Maintain an array in unique state.
function keepUnique(a) {
  function isUnique(elt, i, a) { return !i || a.lastIndexOf(elt, i-1) === -1; }
  function check({name: i})    { if (i !== 'length' && !isUnique(a[i])) { a.splice(i, 1); } }

  var handlers = { update: check, add: check };

  filterInPlace(a, isUnique);
  observeObject(a, makeObserver(handlers));
  return a;
}

// Find all occurrences of element in an array, return indices.
// @NOTUSED
function indexesOf(a, elt) {
  var ret = [], index = 0;
  while ((index = a.indexOf(elt, index)) !== -1) {
    ret.push(index++);
  }
  return ret;
}

// Allow observing map to be applied to array through prototype.
if (!Array.prototype.as) {
	Object.defineProperties(Array.prototype, {
		as: {	value(fn) {	return observingMap(this, fn); } }
	});
}

export {
  observingMap,
  observingOrder
};
