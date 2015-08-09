// sam/Css.js
//
// Upward sample for CSS styling.


import {E, U, T} from '../src/Up';
var dom;


/// ### CSS
///
/// All logic in Upward is written in JavaScript, including CSS.
/// We don't need no stinkin' CSS preprocessors with weird syntax.
/// Here is a styled div for your enjoyment.
///
/// To emulate `STYLE` elements, or external CSS,
/// use the `UpStyle` API to insert rulesheets.


//===START
var style = U({ backgroundColor: 'pink' });
function click() { style.backgroundColor = 'cyan'; }

dom = E('button') .
  is({ style })   .
  does({ click }) .
  has(T("Change my background"));
//===END


export default dom;
