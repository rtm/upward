// keepSliced (Array#of)
// =====================

// Setup.
import {copyOnto} from './Utl';
import {makeObserver, observeObject} from './Obs';

var {max} = Math;
    
// Keep an array sliced as it changes.
export default function keepSliced(a, from, to) {
  var result = [];
  var params = {};

  // Handle changes to parameters.
  // -----------------------------
  function paramChanged(v, i, params, change) {
    if (i === 'a') {
      let old = change.oldValue;
      if (old) {
        unobseveObject(old, observer);
      }
      observeObject(params.a, observer);
    }
  }
  
  // Redo the slice, when paramters have changed.
  function go() {
    copyOnto(params.a.slice(params.from, params.to), result);
  }

  var paramHandlers = { add: paramChanged, update: paramChanged, end: go };
  observeObject(params, makeObserver(paramHandlers));
                
  // Handle changes to array itself.
  // -------------------------------

  // Add an element if it is in range of the slice.
  function add(i, v) {
    console.assert(!isNaN(i), "index in keepSliced#add must be numeric");
    if (i < to) {
      result.push(v);
    }
  }
  
  // Update an element if it is in range of the slice.
  function update(i, v) {
    if (i === 'length') {
      result.length = max(a.length - to, from - to);
    } else {
      console.assert(!isNaN(i), "index in keepSliced#update must be numeric");
      if (i >= from && i < to) {
        result[i - from] = v;
      }
    }
  }
  
  // Delete an element if it is in range of the slice.
  function _delete(i) {
    console.assert(!isNaN(i), "index in keepSliced#_delete must be numeric");
    if (i >= from && i < to) {
      delete result[i - from];
    }
  }
  
  var handlers = {add, update, delete: _delete};
  var observer = makeObserver(handlers);
  
  // Watch for upward changes to parameters.
  upward(a,    a => params.a = a);
  upward(from, from => params.from = from);
  upward(to,   to => params.to = to);

  // Initialize params, which kicks off computation.
  params.a    = valueOf(a);
  params.to   = valueOf(to);
  params.from = valueOf(from);

  return result;
}
