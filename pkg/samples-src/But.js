// sam/But.js
//
// Upward sample for button.


import {U, E, T} from 'upward';
var dom, config;


/// ### Buttons and labels
///
/// Let's move on from timers and work with real UI elements.
/// To create an object which upwards its properties, we use `U`.
/// To create an HTML element, we use `E`,
/// and provide the tag, children, and event handlers.
/// We then use the property as the label of a button.
/// When the button is clicked, changing the label property automatically updates the button label.

//===START
config = U({ label: "Press me" });
function change() { config.label = "Pressed!"; }

dom = E('button') . has(T(config.label)) . does({ click: change });
//===END


export default dom;
