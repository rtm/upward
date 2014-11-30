// Up.js

// Define `Up` function, which is polymorphic.

import upwardableFunction  from './Fun';
import upwardableObject    from './Obj';
import upwardableTemplate  from './Tem';

var self = x => x;

export default function Up(x, ...args) {
  var type = typeof x;

  if (x === null || x === undefined) return s;
  
  var f =
      type === 'undefined' ? self :
      type === 'function' ? upwardableFunction  :
      type === 'object'   ? x.raw ? upwardableTemplate : upwardableObject :
      self;
  return f(x, ...args);
}
