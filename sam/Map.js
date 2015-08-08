// sam/Map.js
// Sample for mapping.


import {U, T, E} from '../src/Up';

var dom, arr;

/// ### Mapping
///
/// To map one array to another in upward-aware fashion, we use `UpMap`.
/// This is also available on the array prototype as <code>as</code>.
/// A common use is to map an array into DOM elements to use as child elements.
/// Here we map an array of numbers onto text nodes inside divs.

  //===START
arr = [1, 2, 3];
function add() { arr . push(Math . floor (Math . random() * 10)) }

dom = E('div') . has(
  [
    E('div') . has(
      arr . as(
        val => E('div') . has(T(val))
      )
    ),
    E('button') . has(T("Add")) . does({click: add})
  ]
);
//===END

export default dom;
