Upward Design
=============

The primary design goal for Upward is to allow programmers to succintly describe the behavior and output of web applications.
We want to keep the API footprint to a minimum.
The target language environment is ES6.
Performance is not a major consideration at this point, but we shall avoid design decisions which prevent optimization in the future.

The fundamental idea is a declarative style, where we can say:

```
country = "USA";
display(country);
country = "Japan";
```

`display` here is intended to be a declaration that we want to display a map of whatever the current value of `country` happens to be. In other words, `country = "Japan"` should act as a trigger to change the map. We often see the following approach to accomplish this:

````
set('country', "USA");

display(get('country')).observes('country');
set('country', "Japan");
```

which in an ES5 world is the only way to capture a variable being set, and specify the dependencies of `displayMap`. Essentially, we have replaced the good old assignment statement with the unwieldy `set('var', value)` in order to be able to watch it, and are forced to adorn our function calls with explicit dependencies using `observes` or some equivalent.

We propose to write the above as:

```
data = U({ country: "Japan" });
display = C(_display);

display(data.country);
data.country = "Japan";
```

Here, `U` transforms the object so as to make its properties watchable, and `C` transforms the function so as to make it observe its parameters. ES6 and features such as `Object.observe` give us the tools to accoplish this streamlining. We call `country` and other properties in `data` "upwardables"; the `data` object itself an "upwardable object"; and the `display` function an "upwardable function".

Upwardable values
-----------------

Upwardable values are values which are capable of updating themselves and being watched. They are called "upwardable" since they can pass their values, and changes to their values, "upward" to a function using them. The most common way of creating an upwardable value is to apply `U` to an object to make its properties into upwardable values.

We could implement upwardable values as some kind of wrapper around the underlying value, but this would prevent us from using them directly as regular values, and force us to access their values as `object.prop.valueOf()` or something similar. We want upwardable values to both be watchable, but also to function as themselves to the maximum extent possible. In Upward, upwardable values have this characteristic, so we can say

```
data = U({ country: "USA });
console.log("I live in " + data.country);
```

and all works as expected. 

Implementation-wise, object-valued upwardable values are themselves, with minimal additional features allowing them to be identified as such, and allowing them to watch and change their values. Primitive-valued upwardable values are the primitives in an object wrapper, such as `Object("USA")`. This allows them to be used as themselves in nearly all contexts, the main exception being boolean values, where instead of saying `!data.bool` we need to say `!Boolean(data.bool)`, or any other construct which forces coercion (for example, `!+data.bool`, or `data.bool == false`). Null and undefined upwardable values are held in special object wrappers.

For debugging purposes, upwardable values are adorned with a unique ID, and are also identifiable by virtue of being kept in a global WeakMap.

A stand-alone upwardable value can be created with the `makeUpwardable` API, but this will rarely be necessary for the end-developer.

Upwardable functions
--------------------

Upwardable functions are functions which are capable of watching their parameters and re-executing themselves when they change. They are most commonly created by the `C` operator on a normal function. Upwardable functions also return upwardable values, so their results can be handled properly as input to other upwardable functions.

### Upwardable functions are based on generators

 In this simplest case, `C(fn)` simply recomputes the function whenever things change. However, we also would like the the following abilities: 

 * maintain internal state between recomputations

 * return a promised result

 * initiate its own recalculation, such as in the case of a timer

To accomplish this, the design is therefore that the function actually underlying upwardable functions are **generators**, which `yield` each successive value. The `C(fn)` notation is actually sugar for wrapping a generator around `fn` and building an upwardable function based on that. If you wish to provide your own generator on which to base an upwardable function, call `makeUpwardableFunction(generator, run)` (an export from `'src/Upw/Fun'`). Here `run` is a function which the generator may call to signal a request for its own recalculation. An mentioned above, the generator may also yield a promise, in which case the new value of the function is then eventual value of the yielded promise when resolved.

It may be the case that the initial call to the underlying function is at a point when the function is not yet ready to deliver a result. In that case, the function may return a default or placeholder value as the first `yield`, or specified as the second argument to `C()`.

### Upwardable functions watch non-parameter upwardable values

It is also desirable that upwardable functions recompute not only when their parameters change, but also when other values affecting the calculation change. In other words, we want `C(x => x+1)` to work properly, but in addition `C(() => model.count + 1)` needs to recompute when `model.count` changes. To accomplish this, upwardable values accessed during the computation of an upwardable function are monitored, and then cause a recalculation when changed.

Upwardable objects
------------------

Upwardable objects are objects whose properties are upwardable values. They are most commonly created by the `U` operator. An upwardable object not only makes upwardable values out of the properties it contains when created, but also creates upwardable values of any properties added in the future.

### Merging upwardable objects

Upwardable objects have access to the methods `and` and `or`, which create deep-merged, upwardable objects. `and` takes the earlier value, `or` takes a later value. So

    U({a: {b: 1}}).and({a: {b: 2}})

returns a value fo `a.b` of 2. This feature is especially useful for objects used as DOM attributes, which contain nexted objects for style and class (see below).

DOM
---

In line with the design objective of "all-JavaScript", we want to avoid yet another language in our stack to define HTML templates, with its own syntax and control structures. Accordingly, in Upward DOM elements are created in JavaScript, using the `E(tagname)` API. This creates a real DOM node, not a shadow or proxy. This API is not upwardable; after all, an element cannot change its tagname once created.

Text nodes are created using `T(text)`. This **is** upwardable, so when `text` changes, the `nodeValue` will change in parallel:

    app = U({ name: "Upward" });
    document.body.appendChild(T(app.name));
    app.name = "Newname";

HTML elements created via `E()` have available to them prototype methods to add attributes, children, event handlers, and value bindings, called `is`, `has`, `does`, and `sets`. This structure allows the setters to be upward-aware, so that changes to attributes, children etc. result in automatic updating of the DOM element. A common pattern in Upward is 

    dom = E('div') . 
      has(children) . 
      is({ class: { list: true } }) . 
      does({ click: handler });

In a minor node to convenience, the `E()` API supports in-line IDs and classes in the form `E('div#id.class')`, which is equivalent to `E('div') . is({ id: 'id' class: { class: true } })`.

### Specifying attributes

Attributes, including classes, styles, and data attributes, are set using the `.is()` method on the `HTMLElement` prototype, also made available as the default export from `src/Upw/Att'. The attributes are specified as a hash of attribute name/value pairs.

Styles, classes, and dataset attributes are specified as sub-hashes. The style sub-hash uses camelCased style property keys specifying the property values, fully upward-aware. The class sub-hash uses camelCased class names with boolean values. The dataset sub-hash uses camelCased data attribute names specifying the attribute value.

### Binding to DOM element values

Input elements maintain their values in properties such as `input.value`, which are not upwardable and cannot be. Changes to such values are reported via DOM events such as `change`. To allow these values to interact with the upwardable system, we provide the `sets()` method on the `HTMLElement` prototype which specifies the name of an upwardable value to keep in sync with the element's value. The bindings are two-way. In other words, setting the upwardable value will set the element's value, and changes in the element's alue will be reflected in the upwardable value. This behavior applies to text inputs, text areas, checkboxes, ranges, radio buttons, etc.

This is the only place in the Upward system where there is anything reminiscent of the "bindings" seen in other systems.






