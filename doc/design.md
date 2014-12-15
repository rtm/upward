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
console.log(data.country.toLowerCase());
```

and all works as expected. 

Implementation-wise, object-valued upwardable values are themselves, with minimal additional features allowing them to be identified as such, and allowing them to watch and change their values. Primitive-valued upwardable values are the primitives in an object wrapper, such as `Object("USA")`. This allows them to be used as themselves in nearly all contexts, the main exception being boolean values, where instead of saying `!data.bool` we need to say `!Boolean(data.bool)`, or any other construct which forces coercion (for example, `!+data.bool`, or `data.bool == false`). Null and undefined upwardable values are held in special object wrappers.

For debugging purposes, upwardable values are adorned with a unique ID, and are also identifiable by virtue of being kept in a global WeakMap.

A stand-alone upwardable value can be created with the `makeUpwardable` API, but this will rarely be necessary for the end-developer.

Upwardable functions
--------------------

Upwardable functions are functions which are capable of watching their parameters and re-executing themselves when they change. They are most commonly created by the `C` operator on a normal function. Upwardable functions also return upwardable values, so their results can be handled properly as input to other upwardable functions.

Upwardable objects
------------------

Upwardable objects are objects whose properties are upwardable values. They are most commonly created by the `U` operator. An upwardable object not only makes upwardable values out of the properties it contains when created, but also creates upwardable values of any properties added in the future.

