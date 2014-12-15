// Application pod for Todos app.

import {makeView} from '../Mvc/Mvc';
import {U} from '../src/Up';

var model = U({name: 'Upward - Todos'});

function controller() { }

function view(model, controller) {
  return E('div');
}

export default function makeAppView(model) {
  return makeView(model, view, controller);
}
