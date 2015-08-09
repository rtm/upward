// sam/Fad.js
//
// Sample for fading

import {E, U, T} from '../src/Up';
import FADE from '../src/Fad';

var dom;


/// ### Fading
///
/// The `FADE` component operates on a DOM element to fade changes in and out.
/// It's easy to write such components in Upward.


//===START
var data = U({ count: 0 });
function click() { data.count++; }

dom = E('div') . has([
  E('button') . has(T("Increment")) . does({ click }),
  FADE(T(data.count), 'slideLeft')
]);
//===END


export default dom;
