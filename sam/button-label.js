import {U, E, T} from '../src/Up';
var dom, config;

//===START
config = U({                                 // create upwardable object
  label: "Press me"                          // with dynamic property
});                     

function change() { config.label = "Pressed!"; } 

dom = E('button') .                         // make HTML element with
  has(T(config.label)) .                    // child
  does({ click: change })                   // and event handler
;
//===END

export default dom;
