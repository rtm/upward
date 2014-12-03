import {Up, Tx, El} from '../src/Up';
var dom, config, arr;

//===START
arr = [1, 2, 3];
function add() { arr.push(Math.random()) }

dom = El('div').has([
  El('div')
    .has(arr.as(
      val => El('div').has(Tx(val))
    )),
  El('button')
    .has ([Tx("Add")])
    .does({click: add})
]);
//===END

export default dom;
