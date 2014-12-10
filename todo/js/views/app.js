// App view
// ========

import {E, T, H1, P, A} from '../../../src/Up';
import todosView from './todos';

// Make DOM for header.
function header() {
  return E('header#header') . has([
    H1("todos") // some kind of placeholder?
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

// Create entire app view.
export default function app() {
  return E('div') . has([header(), todosView(), footer()]);
}

// Todo item model
// ===============

import {U} from '../../../src/Up';

export default function(title, completed) {
  title = title.trim();
  return U({title, completed});
}
