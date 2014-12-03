import {Up, UpElement, UpText} from '../src/Up';
var dom, config;

//===START
config = Up({                                 // create upwardable object
  label: "Press me"                           // with dynamic property
});                     

function change() { config.label = "Pressed!" } 

dom = El('button')                            // make HTML element with
  .has(Tx(config.label)),                     // child
  .does({ click: change })                    // and event handler
;
//===END

export default dom;
