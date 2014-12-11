// Upward version of Todos MVC
// ===========================

import LocalStorage from '../src/Utl/Sto';
import {U, E, T, H1, P, A, C, F} from '../src/Up';

var {keys} = Object;

const LOCAL_STORAGE_ID = 'todos-upward';
var localStorage = LocalStorage(LOCAL_STORAGE_ID);

// Models
// ------

var todos = {
  todos: [],
  save()    { localStorage.put(this.todos);       return this; },
  load()    { this.todos = localStorage.get();    return this; },
  add(item) { this.todos.push(item); this.save(); return this; }
};

// Todo item model
function todoItem(title, completed) {
  title = title.trim();
  return U({title, completed});
}

// Controllers
// -----------

// init()    { this.model = todosModel().load(); },
// add(item) { this.model.add(item); }
// clearCompleted() { this.todos.filter(todo => this.todos.remove(todo)); }
// remove(item) { // FIX
//   this.remove = function (key) {
//     this.list.splice(key, 1);
//     app.storage.put(this.list);
//   }
// },

var amountCompleted = C(todos => todos.filter(todo => todo.completed).length);
var allComplete     = C(todos => todos.every(todo => todo.completed));

var completeAll     = C(todos => {
  var allCompleted = allCompleted(todos);
  todos.forEach(todo => todo.completed = allCompleted);
});

function toggleComplete(todo) { todo.completed = !this.model.completed.valueOf(); }
function edit()           { this.editing = true; }
function doneEditing()    { this.editing = false; /* handle empty title */}
function cancelEditing()  { this.editing = false; /* revert title*/ }
function clearTitle(todo) { todo.title = ''; }
function remove()         { }

// Views
// -----

/**
 * ## todosView
 * 
 * View for list of todos.
 * @return {HTMLElement}
 */

function todoViews() {
  var model  = todosModel();
  var todosConfig = U({ filter: 'all' });

  // View for one todo item.
  function todoView(item) {
    var todoConfig    = U({ editing: false });
    var toggleEditing = C(_ => todoConfig.editing = !Boolean(todoConfig.editing));
    var doneEditing   = C(_ => todoConfig.editing = false);
    var edit          = C(_ => todoConfig.editing = true );
    
    return E('li') .
      is({ class: { completed: item.completed, editing: config.editing} }) .
      has([
        
        E('div#view') . has ([
          E('input') . is({type: 'checkbox'}) . does({click: 0}) . sets(item.completed),
          LABEL(item.title) . does({ doubleclick: edit })
        ]),
        
        E('input.edit') . sets(item.title) . does({ blur: doneEditing })
      ])
    ;
  }

  // View for foooter, containing counts and filters
  function footer() {
    var amountCompleted = ctrl.amountCompleted();
    var amountActive = ctrl.list.length - amountCompleted;
    
    return E('footer') . is ({ id: 'footer' }) . has([
      
      E('span') . is ({ id: 'todo-count' }) . has([
//        E('strong') . has (T(F`${count} items left`)) // jshint ignore:line
      ]),
      
      // Filters (all, active, completed)
      E('ul') . is({ id: 'filters' }) . has ([
        E('li') . has(T("All"))       . does({ click: _ => data.filter = 'all'       }),
        E('li') . has(T("Active"))    . does({ click: _ => data.filter = 'active'    }),
        E('li') . has(T("Completed")) . does({ click: _ => data.filter = 'completed' })
      ]),
      
      /* jshint ignore:start */
      E('button') .
        has (T(F`Clear completed ${completedcount}`)) . // jshint ignore:line
        is  ({ id: 'clear-completed' }) .
        does({ click: _ => 0 }) //clearCompleted })
      /* jshint ignore:end */
    ]);
  }

  var visible = C(function(todo) {
    switch (data.filter) {
    case 'all':      return true;
    case 'active':   return todo.active;
    case 'complete': return todo.completed;
    }
  });
                  
  // View for list items
  function list() {
    return E('ul#todo-list') . has(model.list . if(visible) . as(todoView));
  }
  
  return E('section#main') . has([list(), footer()]);
}

// App view
// --------

// Create entire app view.
export default function appView() {

  // Make DOM for header.
  function header() {
    return E('header#header') . has([
      H1("todos") // some kind of placeholder?
    ]);
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
  
  return E('div') . has([header(), todosView(), footer()]);
}
