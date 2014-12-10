// Upward version of Todos MVC
// ===========================

import LocalStorage from '../../../src/Utl/Sto';
import {U, E, T, H1, P, A, C} from '../../../src/Up';

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

// Todos controller
function todosController(todos) {
  this.todos = todos;

  return {
    init()    { this.model = todosModel().load(); },
    add(item) { this.model.add(item); }
    clearCompleted() { this.todos.filter(todo => this.todos.remove(todo)); }
    remove(item) { // FIX
      this.remove = function (key) {
        this.list.splice(key, 1);
        app.storage.put(this.list);
      }
    },
    amountCompleted() { return this.todos.filter(todo => todo.completed).length },
    allCompleted()    { return this.todos.every(todo => todo.completed); },
    completeAll()     {
      var allCompleted = this.allCompleted();
      this.todos.forEach(todo => todo.completed = allCompleted);
    },
    clearCompleted()  { }
  };
};

// Todo item controller
function todoController() {
  return {
    toggleComplete() { this.model.completed = !+this.model.completed; },
    edit()           { this.editing = true; },
    doneEditing()    { this.editing = false; /* handle empty title */},
    cancelEditing()  { this.editing = false; /* revert title*/ },
    clearTitle()     { this.title = ''; },
    remove()         { },
  };

// Views
// -----

/**
 * ## todosView
 * 
 * View for list of todos.
 * @return {HTMLElement}
 */

function todoViews() {
  var model = todosModel();
  var data = U({ filter: 'all' });

  // View for one todo item.
  function todoView(item) {
    return E('li') .
      is({ class: { completed: item.completed, editing: item.editing} }) .
      has([
        
        E('div#view') . has ([
          E('input') . is({type: 'checkbox'}) . does({click: 0}) . sets(item.complete),
          LABEL(item.title) . does({ doubleclick: edit })
        ]),
        
        E('input.edit') . sets(item.title) . does({ blur: doneediting })
      ])
    ;
  }

  // View for foooter, containing counts and filters
  function footer() {
    var amountCompleted = ctrl.amountCompleted();
    var amountActive = ctrl.list.length - amountCompleted;
    
    return E('footer') . is ({ id: 'footer' }) . has([
      
      E('span') . is ({ id: 'todo-count' }) . has([
        E('strong') . has (T(F`${count} items left`))
      ]),
      
      // Filters (all, active, completed)
      E('ul') . is({ id: 'filters' }) . has ([
        E('li') . has(T("All"))       . does({ click: _ => data.filter = 'all'       }),
        E('li') . has(T("Active"))    . does({ click: _ => data.filter = 'active'    }),
        E('li') . has(T("Completed")) . does({ click: _ => data.filter = 'completed' })
      ]),
      
      E('button') .
        has (T(F`Clear completed ${completedcount}`)) .
        is  ({ id: 'clear-completed' }) .
        does({ click: clearCompleted })
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
  
  return E('div') . has([header(), todosView(), footer()]);
}
