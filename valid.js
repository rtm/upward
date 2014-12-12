// Create a view bsed on a model and view and controller functions.
// The controller is cognizant of its parent.
function makeView(model, view, controller, parent) {
  return view(model, controller(model, parent));
}

// Create a set of views based on a model with its view and controller, and a function
// to create the subviews.
function makeSubViews(model, view, controller, parent) {
  return model . as(model => makeView(model, view, controller, parent));
}

// App cluster
// -----------
var appModel = U({name: 'Upward - Todos'});

function makeAppView(model) {
  return makeView(model, appView, appController);
}

function appController() { }

function appView(model, controller) {
  return E('div');
}

// Todos cluster
// -------------
var todosModel = [];

function todosController(model, parent) {
  return {
    remove(item) { model.omit(item); },
    count()      { return model.length; }
  };
}

// Create todosView against a model.
function makeTodosView(model) {
  return makeView(model, todosView, todosController);
}

function todosView(model, controller) {
  var todo_views = makeSubViews(model, makeTodoView, todoController, controller);
  return E('div') . has(todo_views);
}

// Todo cluster.
var todo = {};
function todoController(model, parent) {
  return {
    remove() { parent.remove(this); }
  };
}

// to create todoView
function makeTodoView(model) {
  return makeView(model, todoView, todoController);
}

