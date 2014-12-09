// Todos model
// ===========

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


  
