// sam/Ran.js
//
// Sample for range-type input elemnet.


import {E, U, T, F, V} from 'upward';

var dom;


/// ### Sliders
///
/// A slider is just an `input` element with type `range`.
/// `.setsImmediate` works like `.sets` but reacts in real time to any changes.
/// The `V` sets up a single upwardable value.
/// Here, we tie the slider value to font size.


//===START
var size = V(12);
var style = { fontSize: F`${size}pt` };
var SLIDER = { type: 'range', min: 6, max: 48, value: 12 };

dom = E('div') . has([
  E('span')
    . has("Sample text")
    . is(U({ style }))
  ,

  E('input')
    . is(SLIDER)
    . setsImmediate(size)
  ,

  F`Size: ${style.fontSize}`
]);
//===END


export default dom;
