import {Up, El, Tx, UpCount} from '../src/Up';
var dom, config;

//===START
config = Up({tick: 1000});

dom = El('div').has([
  El('button').has([Tx("Slower")]).does({click: () => config.tick *= 1.5}),
  El('button').has([Tx("Faster")]).does({click: () => config.tick /= 1.5}),
  Tx(UpCount(config.tick))
]);
//===END

export default dom;
