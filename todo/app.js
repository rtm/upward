// Application pod for Todos app
// =============================

import {U, E, T, H1, P, A} from '../src/Up';
import {makeView} from '../src/Upw/Mvc';
var todos = function() { };
//import todos from './todos';

// Subcomponents: header and footer
// ---------------------------------

// Make DOM for header.
function header(model) {
  return E('header#header') . has([
    H1(model.name) // some kind of placeholder?
  ])
}

// Create page footer.
function footer() {
  return E('footer') . has([
    P("Double-click to edit a todo"),
    E('p') . has([
      T("Created by "),
      A("Bob Myers", "http://github.com/rtm")
    ]),
    E('p') . has([
      T("Part of "),
      A("TodoMVC", "http://todomvc.com")
    ])
  ]);
}

// MVC components for app
// ----------------------

// Application view combines header, main part, and footer.
function view(model) {
  return E('div') . has([header(model), todos(), footer()]);
}

// Application controller does nothing.
function controller() {
  return { };
}

export default makeView(view, controller);
