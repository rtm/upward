Upward Design
=============

The primary design goal for Upward is to succintly describe the behavior of front-end web applications.

Other goals/parameters::
* Minimize the API footprint.
* Leverage modern technologies, including ES6.

The fundamental idea is a declarative style, where we can say:

```
country = "USA";
display(country);

// then later...
country = "Japan";
```

`display` here is intended to be a declaration that we want to display a map of whatever the current value of `country` happens to be. In other words, `country = "Japan"` should act as a trigger to change the map. In other frameworks, We see the following kind of approach to accomplish this:

````
set('country', "USA");
display(get('country')).observes('country');

// then later...
set('country', "Japan");
```

because in an ES5 world this is the only way to capture a variable being set, and specify the dependencies of `display`. Essentially, we have replaced the good old assignment statement with the unwieldy `set('var', value)` in order to be able to watch it, and are forced to adorn our function calls with explicit dependencies using `observes` or some equivalent.

We propose to write the above as:

```
data =    U({ country: "USA" });
display = C(_display);
display(data.country);

// then later...
data.country = "Japan";
```

Here, `U` transforms the object so as to make its properties watchable, and `C` transforms the function so as to make it watch its parameters. ES6 and features such as `Object.observe` give us the tools to accomplish this streamlining. We call `country` and other properties in `data` "upwardables" or "upwardable values"; the `data` object itself an "upwardable object"; and the `display` function an "upwardable function".

Upwardable values
-----------------

Upwardable values are values which are capable of updating themselves and being watched. They are called "upwardable" since they can pass their values, and changes to their values, "upward" to a function using them. The most common way of creating an upwardable value is to apply `U` to an object to make its properties into upwardable values.

We could implement upwardable values as some kind of wrapper around the underlying value, but this would prevent us from using them directly as regular values, forcing us to access their values as `object.prop.valueOf()` or something similar. We want upwardable values to both be watchable, but also to function as themselves to the maximum extent possible. In Upward, upwardable values have this characteristic, so we can say

```
data = U({ country: "USA" });
console.log("I live in " + data.country);
```

and all works as expected. 

### Implementation

Object-valued upwardable values are themselves, with minimal additional features allowing them to be identified as such, and allowing them to watch and report changes to their values. Primitive-valued upwardable values are the primitives in an object wrapper, such as `Object("USA")`. This allows them to be used as themselves in nearly all contexts, the main exception being boolean values, where instead of saying `!data.bool` we need to say `!Boolean(data.bool)` or `!data.bool.valueOf()`, or any other construct which forces coercion (for example, `!+data.bool`, or `data.bool == false`). Null and undefined upwardable values are held in special object wrappers.

Upwardable values are identifiable by virtue of being kept in a global WeakMap. For debugging purposes, they are adorned with a unique ID.

A stand-alone upwardable value can be created with the `makeUpwardable` API exported from `'src/Upw/Upw'`, but this will rarely be necessary for the end-developer.

Upwardable functions
--------------------

Upwardable functions are functions which are capable of watching their parameters and re-executing themselves when they change. They are most commonly created by the `C` operator on a normal function. Upwardable functions also return upwardable values, so their results can be handled properly as input to other upwardable functions.

### Upwardable functions are based on generators

 In this simplest case, `C(fn)` simply recomputes the function whenever things change. However, we also would like the the following abilities: 

 * maintain internal state between recomputations
 * return a promised result
 * initiate its own recalculation, such as in the case of a timer

To accomplish this, the design is that the functions actually underlying upwardable functions are **generators**, which `yield` each successive value. The `C(fn)` notation is actually sugar for wrapping a generator around `fn` and building an upwardable function based on that. If you wish to provide your own generator on which to base an upwardable function, call `makeUpwardableFunction(generator, run)` (an export from `'src/Upw/Fun'`). Here `run` is a function which the generator may call to signal a request for its own recalculation. Your generator should yield an initial value, then yield additional values based on the array of revised arguments passed with each call to `next()`. As mentioned above, the generator may also yield a promise, in which case the new value of the function is then eventual value of the yielded promise when resolved.

It may be the case that the initial call to the underlying function is at a point when the function is not yet ready to deliver a result. In that case, the function may return a default or placeholder value as the first `yield`, or specified as the second argument to `C()`.

### Upwardable functions watch non-parameter upwardable dependencies

It is also desirable that upwardable functions recompute not only when their parameters change, but also when other values affecting the calculation change. In other words, we want `C(x => x+1)` to work properly, of course, but in addition `C(() => model.count + 1)` needs to recompute when `model.count` changes. To accomplish this, upwardable values accessed during the computation of an upwardable function are monitored, and trigger a recalculation when changed.

Upwardable objects
------------------

Upwardable objects are objects whose properties are upwardable values. They are most commonly created by the `U` operator. An upwardable object not only makes upwardable values out of the properties it contains when created, but also creates upwardable values of any properties added in the future.

### Merging upwardable objects

Upwardable objects have access to the methods `and` and `or`, which create deep-merged, upwardable objects. `and` takes the earlier value, `or` takes a later value. So

    U({ a: { b: 1 } }) . and({ a: { b: 2 } })

returns a value for `a.b` of 2. This feature is especially useful for objects used as DOM attributes, which contain nested objects for style and class (see below).

### Upwardable properties as promises

Upwardable properties are promise-aware. In other words, setting an upwardable property to a promise will result in that property's value eventually being set to the resolved value of the promise. For instance, we can set `app.model = asynchTask();`, and `app.model` will be set to the resulting value when ready. If the promise fails, then `app.model` will be left unchanged. Until the promise resolves, accessing the property will retrieve its value prior to being set to a promise.

Note that this means that promises themselves cannot be held in upwardable properties on upwardable objects. If you assign a promise to an upwardable property in hopes of keeping it there,, sooner or later, when the promise resolves, the property will take on the resolved value.

DOM
---

In line with the Upward design objective of "all-JavaScript", we want to avoid yet another language in our stack to define HTML templates, with its own odd-ball syntax and control structures. Accordingly, in Upward DOM elements are created in JavaScript, using the `E(tagname)` API. This creates a real DOM node, not a shadow or proxy. Some call this "sugared DOM". For more information, see [here](http://blog.fastmail.com/2012/02/20/building-the-new-ajax-mail-ui-part-2-better-than-templates-building-highly-dynamic-web-pages/). This API is not upwardable; after all, an element cannot change its tagname once created.

Text nodes are created using `T(text)`. This **is** upwardable, so when `text` changes, the `nodeValue` will change in parallel:

    app = U({ name: "Upward" });
    document.body.appendChild(T(app.name));
    app.name = "Newname";

HTML elements created via `E()` have available to them prototype methods for basic operations:

* `is`, to set attributes, classes and styles
* `has`, to set children
* `does`, to set event handlers
* `sets`, to bind element values

All these setters are upward-aware, so that changes to attributes, children etc. result in automatic updating of the DOM element. A common pattern in Upward is 

    dom = E('div') . 
      has(children) . 
      is({ class: { list: true } }) . 
      does({ click: handler });

In a gratuitous nod to convenience, the `E()` API supports in-line IDs and classes in the form `E('div#id.class')`, which is equivalent to `E('div') . is({ id: 'id' class: { class: true } })`.

### Specifying attributes

Attributes, including classes, styles, and data attributes, are set using the `.is()` method on the `HTMLElement` prototype, also made available as the default export from `'src/Upw/Att'`. The attributes are specified as a hash of attribute name/value pairs.

Styles, classes, and data attributes are specified as sub-hashes, with full upward treatment.

* The `style` sub-hash uses camelCased style property keys specifying the property values.
* The `class` sub-hash uses camelCased class names with boolean values (`true` to turn on that class). 
* The `dataset` sub-hash uses camelCased data attribute names specifying the attribute value.

The design for specifying classes facilitates easily adding and removing classes by simply specifying and modifying boolean-valued properties.

### Binding to DOM element values

Input elements maintain their values in properties such as `input.value`, which are not upwardable and cannot be. Changes to such values are reported via DOM events such as `change`. To allow these values to interact with the upwardable system, we provide the `sets()` method on the `HTMLElement` prototype which specifies the name of an upwardable value to keep in sync with the element's value. The bindings are two-way. In other words, setting the upwardable value will set the element's value, and changes in the element's alue will be reflected in the upwardable value. This behavior applies to text inputs, text areas, checkboxes, ranges, radio buttons, etc.

This is the only place in the Upward system where there is anything reminiscent of the "bindings" seen in other systems.

### Convenience routines

Merely for convenience, Upward exports `P`, `H[1-6]`, `B`, `I`, `LI`, `LABEL`, `A`, and `BUTTON` to create the corresponding type of DOM element. Their implementation may be found in `'src/Upw/Tag'`. Most take string arguments. `A` takes a second argument for `href`. `BUTTON` takes a second argument for click handler. These routines are offered against our better judgment as sugar to save a few keystrokes. Among other defects, they provide no way to specify ID or class, as would be possible with `E('p#id.class')`.

Template strings
----------------

We often want to create strings which include variable values, for instance for use in text nodes. Of course we can do this using an upwardable function, such as `str =C(count => count + ' items')` and then invoke it as `str(model.count)`. However, this becomes cumbersome for more complex strings involving more values. We take advantage of the ES6 template string capability to make this dead easy, using the `F` template string tag:

```
F`${model.count} items`
```

We can now create a DOM text node displaying the auto-updated string by simply saying

```
T(F`${model.count} items`)
```

MVC
---

Upward does not claim to be an application framework. It is an application layer. The organization of application data, application logic, and application display is fundamentally up to the individual developer. However, Upward does offer a minimal MVC framework which is mainly a set of concepts and principles and bits of sugar. For details, see `Mvc.md`.

In the Upward MVC model, a "view" has no special meaning. It is not a special class with a special `render` method invoked at special times by some special superstructure. Any function which returns a DOM element can be considered a view. A "model" also does not have any special meaning. Any upwardable object can be considered a model. A "controller" also has no special meaning. Any object providing methods can be considered a controller.

However, to make it easier to follow an MVC approach, and to promote MVC practices, Upward offers a minimal set of APIs to make MVC more convenient. The primary interface is `makeView`, which can be imported from `'src/Upw/Mvc'`, and takes a view function and a controller function (a function which creates a controller), returning a function which can be invoked with a model to create a view.

Because upwardable properties are promise-aware, the models used in Upward's mini-MVC implementation can also be promises, and everything will work as expected:

    makeMyAppView = makeView(myAppView, myAppController);
    app           = U({ model: getRemoteData() });
    view          = makeMyAppView(app.model);
    document.body.appendChild(view);

CSS
---

Upward has a religious aversion to non-JS pseudo-languages which pollute the stack, require special preprocessing, and separate logically connected parts of the application. Prime examples include templating languages and CSS languages with underpowered logical constructs and odd syntaxes. For CSS, Upward offers JS-based ways to specify application styles, with the `UpStyle` API which is the default export from `'src/Upw/Css'`. This interface simply takes an array of CSS rules, such as

```
UpStyle([
  ["body", { 
		fontFamily : 'sans-serif',
		backgroundColor: theme.bodyBackgroundColor
	}]
]);
```

which are fully upward-aware, so that `theme.bodyBackgroundColor = 'gray';` will automatically rewrite the corresponding rule. Of course, this is normal approach to styling, which to simply apply classes and styles directly to elements via `E(tagname) . is({ })`.

The `UpStyle` API also accepts a second argument, specifying a DOM element to which the rules are scoped, even if the browser does not support scoped styles.

Convenience routines
--------------------

The Upward design philosophy frowns on excessive convenience routines. They result in an obese API footprint. But although not an integral part of the library, Upward does provide upwardable implementations of commonly used constructs, including the following:

 * in `'src/Upw/Cnt'`: `UpCount`, a function which automaticaly counts up every so many milliseconds
 * in `'src/Upw/Fns'`:
    - `equals`, to compare two values
    - `not`, to invert an value
    - `log`, to log a value

Testing
-------

Existing test runners such as Jasmine are not well-suited for writing tests for Upward itself or applications which use Upward. For one thing, they don't necessarily play well with Traceur/ES6, at least not without special black-box adapters. More importantly, Upward is so aynchronous in nature, and most test runners require special gyrations to deal with this. Therefore, Upward has its own test runner. The `'Tst'` module exports two functions for this purpose, `test` and `testGroup`.

 * `test` runs one test specified as a function
 * `testGroup` runs a group of tests.

The results may be displayed in the console using "reporters", either

 * `consoleReporter`, displaying the results on the console, or
 * `htmlReporter`, which uses Upward itself in dog-food fashion to display results on the HTML page

Although any assertion library may be used, we prefer `assert`, and that is what is used for Upward's own tests. 