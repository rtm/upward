// sam/Css.js
// Upward sample for CSS styling.


import {E, U, T} from '../src/Up';
var dom;


/// ### CSS
///
/// All app logic in Upward is written in JavaScript.
/// We don't need no stinkin&rsquo; CSS preprocessors with weird syntax.
/// The <code>UpStyle</code> API is used to insert rulesheets.
/// Here is a styled div for your enjoyment.
/// By the way, Upward suppports scoped CSS rules.
///
/// This is the approach to emulating <code>STYLE</code> elements, or external CSS.
/// Of course, classes and styles can be placed on elements, as shown in a later example.


//===START
var style = U({ backgroundColor: 'pink' });
function click() { style.backgroundColor = 'cyan'; }

dom = E('button') .
  is({ style }) .
  does({ click }) .
  has(T("Change my background"));
//===END

export default dom;
