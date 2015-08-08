import {U, E, T} from '../src/Up';
var dom, config;

//===START
config = U({ label: "Press me" });
function change() { config.label = "Pressed!"; }

dom = E('button') . has(T(config.label)) . does({ click: change });
//===END

export default dom;
