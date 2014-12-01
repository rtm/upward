import {Up, UpButton, UpText, UpDiv, UpCount} from '../src/Up';
var dom, config;

//===START
config = Up({tick: 1000});

dom = UpDiv([
  UpButton ("Slower", () => config.tick *= 1.1),
  UpButton ("Faster", () => config.tick *= 0.9),
  UpText   (UpCount(config.tick))
]);
//===END

export default dom;
