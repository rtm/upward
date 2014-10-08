import {makeStyles} from './Css';

export function RunUpward(app) {
  var root = document.getElementById(app.root);
  root.appendChild(app.DOM);
  makeStyles(root, app.CSS);
}
