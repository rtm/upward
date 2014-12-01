import {Up, UpElement, UpText} from '../src/Up';
var dom, config;

//===START
config = Up({                                 // create upwardable object
  label: "Press me"                           // with dynamic property
});                     

dom = UpElement(                              // make HTML element with
  'button',                                   // tagName,
  [UpText(config.label)],                     // children,
  {},                                         // attributes,
  { click: () => config.label = "Pressed!" }  // and event handlers
);
//===END

export default dom;
