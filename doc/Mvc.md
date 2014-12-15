Upward MVC
==========

The Upward MVC system is not a framework,
but rather a set of concepts, recommendations, and sugar.

Basic concepts
--------------

* A **model** is any object containing relevant data.
 
* A **view** is a function which returns a DOM element.
The arguments to a view are the model and a controller.

* A **controller** is an object with member functions to access and mutate the model.
Controllers are generally created by a function,
confusingly sometimes also called `controller`,
whose arguments are the model and a "parent" controller.

Making views
------------
The basic export from the `Mvc` module is `makeView`, which returns the
value of a view, given a model and a function to make the controller.
This can be used to construct a simple MVC "pod" as follows:
```
var model = U({ name: "Bob", selected: false });

/* View displays clickable model value */
function view(model, controller) {
  return E('div') . has(T(model.name)) . does({ click: controller.select });
}

/* Controller with single action */
function controller(model, parent) {
  return { select() { model.selected = true; } };
}

document.body.appendChild(makeView(model, view, controller));
```

Homogeneous composite views
---------------------------
A common use case is a view composed of views on elements of an array.
For this, the Upward MVC system provides the `makeElementViews` API.
It takes an array-valued model, a view to use for its elements,
and a controller-maker, as well as a parent--normally the controller of the top-level model.

Here is a simple example of using `makeElementViews`:
```
function itemController(model, parent) {
  return { remove(): { parent.remove(this); } };
}
function itemView(model, controller, parent) {
  return E('div') . has(T(model)) . does({ click: controller.remove});
}
function listController(model, parent) {
  return { remove(element) { model.remove(element); } };
}
function listView(model, controller) {
  return E('div') . has(makeElementViews(model, itemView, itemController, controller));
}
var model = [1, 2];
document.body.appendChild(makeView(model, listView, listController));
```

Heterogeneous composite views
-----------------------------
Let us also look at how to make a heterogeneous composite view.
We want to create a view compositing A and B.
There is no particular sugar that is useful here, so we do it ourselves.
```
function aController(model)       { return { }; }
function aView(model, controller) { return T(`A is ${model}`); }

function bController(model)       { return { }; }
function bView(model, controller) { return T(`B is ${model}`); }

function makeAView(model) { return makeView(model, aView, aController); }
function makeBView(model) { return makeView(model, bView, bController); }

function topView(model) {
  return E('div') . has([makeAView(model.a), makeBView(model.b)]);
}
var model = { a: 'hello', b: 'world' };

document.body.appendChild(topView(model));
```

In this example we see an example of a pattern of defining functions of the form
`makeXxxView`, which are convenience routines that allow consumers to create the view,
including its controller, with a single call.
It is common that this would be the export from a "pod"-style module.
  
