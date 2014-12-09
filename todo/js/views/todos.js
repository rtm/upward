// Todos view
// ==========

import {E, T, H1, P, A, C} from '../../../src/Up';
import todoView from './todo';
import todosModel from '../models/todos';

var {keys} = Object;

export default function() {
  var model = todosModel();
  var data = U({ filter: 'all' });

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
