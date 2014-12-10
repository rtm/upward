// Upward version of Todos MVC
// ===========================

import LocalStorage from '../../../src/Utl/Sto';
import {U} from '../../../src/Up';

const LOCAL_STORAGE_ID = 'todos-upward';
var localStorage = LocalStorage(LOCAL_STORAGE_ID);

export default {
  todos: [],
  save()    { localStorage.put(this.todos);       return this; },
  load()    { this.todos = localStorage.get();    return this; },
  add(item) { this.todos.push(item); this.save(); return this; }
};

// Todos controller
// ===============

import todosModel from '../models/todo';

export default {
  init()    { this.model = todosModel().load(); },
  add(item) { this.model.add(item); }

  this.add = function () {
    var title = this.title().trim();
    if (title) {
      this.list.push(new app.Todo({title: title}));
      app.storage.put(this.list);
    }
    this.title('');
  };

  this.isVisible = function (todo) {
    switch (this.filter()) {
    case 'active':
      return !todo.completed();
    case 'completed':
      return todo.completed();
    default:
      return true;
    }
  };

  this.complete = function (todo) {
    if (todo.completed()) {
      todo.completed(false);
    } else {
      todo.completed(true);
    }
    app.storage.put(this.list);
  };

  this.edit = function (todo) {
    todo.previousTitle = todo.title();
    todo.editing(true);
  };

  this.doneEditing = function (todo, index) {
    todo.editing(false);
    todo.title(todo.title().trim());
    if (!todo.title()) {
      this.list.splice(index, 1);
    }
    app.storage.put(this.list);
  };

  this.cancelEditing = function (todo) {
    todo.title(todo.previousTitle);
    todo.editing(false);
  };

  this.clearTitle = function () {
    this.title('');
  };

  this.remove = function (key) {
    this.list.splice(key, 1);
    app.storage.put(this.list);
  };

  this.clearCompleted = function () {
    for (var i = this.list.length - 1; i >= 0; i--) {
      if (this.list[i].completed()) {
        this.list.splice(i, 1);
      }
    }
    app.storage.put(this.list);
  };

  this.amountCompleted = function () {
    var amount = 0;
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].completed()) {
        amount++;
      }
    }
    return amount;
  };

  this.allCompleted = function () {
    for (var i = 0; i < this.list.length; i++) {
      if (!this.list[i].completed()) {
        return false;
      }
    }
    return true;
  };

  this.completeAll = function () {
    var allCompleted = this.allCompleted();
    for (var i = 0; i < this.list.length; i++) {
      this.list[i].completed(!allCompleted);
    }
    app.storage.put(this.list);
  };
};
// Todo item controller
// ====================

export default todoController() [
}

  this.isVisible = function (todo) {
    switch (this.filter()) {
    case 'active':
      return !todo.completed();
    case 'completed':
      return todo.completed();
    default:
      return true;
    }
  };

  this.complete = function (todo) {
    if (todo.completed()) {
      todo.completed(false);
    } else {
      todo.completed(true);
    }
    app.storage.put(this.list);
  };

  this.edit = function (todo) {
    todo.previousTitle = todo.title();
    todo.editing(true);
  };

  this.doneEditing = function (todo, index) {
    todo.editing(false);
    todo.title(todo.title().trim());
    if (!todo.title()) {
      this.list.splice(index, 1);
    }
    app.storage.put(this.list);
  };

  this.cancelEditing = function (todo) {
    todo.title(todo.previousTitle);
    todo.editing(false);
  };

  this.clearTitle = function () {
    this.title('');
  };

  this.remove = function (key) {
    this.list.splice(key, 1);
    app.storage.put(this.list);
  };

  this.clearCompleted = function () {
    for (var i = this.list.length - 1; i >= 0; i--) {
      if (this.list[i].completed()) {
        this.list.splice(i, 1);
      }
    }
    app.storage.put(this.list);
  };

  this.amountCompleted = function () {
    var amount = 0;
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].completed()) {
        amount++;
      }
    }
    return amount;
  };

  this.allCompleted = function () {
    for (var i = 0; i < this.list.length; i++) {
      if (!this.list[i].completed()) {
        return false;
      }
    }
    return true;
  };

  this.completeAll = function () {
    var allCompleted = this.allCompleted();
    for (var i = 0; i < this.list.length; i++) {
      this.list[i].completed(!allCompleted);
    }
    app.storage.put(this.list);
  };
};

