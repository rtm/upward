Upward is a JavaScript framework for synchronizing data through your application. It works by introducing an `Upwardable` object which represents a value which can propagate changes upwards, and and `upwardified` functions which take upwardable arguments and know how to re-invoke themselves when they change.

"Upward" is an acronym for "Upward Propagation With ARgument Detection", if you insist.

### Introduction

As the computing community struggles how to integrate the technologies we've developed
for mark-up, styling, and program logic, it has come up with a witches brew of mixed-modes.
These include mark-up slipped into programs, programs treating mark-up as strings,
CSS pre-processors like LESS providing their own logical structures, 
and mark-up languages with built-in logic (templates).
We have ended up with styles inside logic, logic inside styles,
logic inside mark-up, and mark-up inside logic.
In ridiculous cases, we have logic and styles inside mark-up inside logic.
We have build a tangled web of templating languages, libraries like jQuery,
and CSS preprocessors.
They make our systems hard to write, debug, and maintain, and complicated and slow to build.

In Upward, in contrast, everything is logic.
Mark-up and styling is all described by logic.
It is a purely JS world.

### Hello world

		import {P} from 'U';
    import {TEXT, BUTTON} from 'dom';

    var model = P({ msg: "Hi, Bob." });
    document.body.appendChild(TEXT(model.msg));

    var button = BUTTON().event('click', function() {
        model.msg = "Hello, world.";
    });

`P` (for "properties") arranges for the properties (in this case, `msg`)
to be upwarded to upward-aware functions to which they are passed,
such as `TEXT` in the succeeding line.
So when the user presses the button, which changes the value of `model.msg`,
the display automatically updates itself.

For conciseness, many upward functions are single uppercase letters.
If you prefer, you many import them under any alternative name you want.

### Template strings

Upward properties may also be used with ES6 string templates ("quasi-literals"):

    import {S} from 'U';     
    document.body.appendChild(TEXT(S`I say, "${model.msg}".`));

The `S` is a template string helper which "upwardizes" the property references within the template string
(surrounded in backticks)..
THe content of the text mode is automatically updated whenever the property changes.

### Computed functions

We can define computed values which are automatically updated when their inputs change:

    import {C} from 'U';
    document.body.appendChild(TEXT(C(_ => model.msg + ", he said.")));

Here `C` stands for "computed".

### Taking values

To make all this work, `model.msg` is actually represented by a special kind of object.
That object is created when the `P(msg: "msg")` call is made.
I can use `model.msg` in a context where a string primitive is expected, and things will work normally.
In other cases, however, I may need to tell JS to explictly use the special object's value.
That is the purpose of the `V` function (for "value"). 
We can use it as follows:

    TEXT(C(_ => V(model.msg).toUpperCase()))

As a matter of style and readability, we use `_` to represent a "don't care" argument list
to ES6 arrow functions.

In English what the above says, is

 1. Create an "upwardified" (responsive) text node,
 1. whose value is computed by an "upwardified" (responsive) function, which 
 1. takes the value of the "upwardified" (responsive) property
 1. and uppercases it.

In actuality, `toUpperCase` and other useful functions are defined directly on upwardables,
allowing you instead to say:

    TEXT(C(_ => model.msg.toUpperCase()))

### Creating DOM

DOM elements are created with the `E` routine, which is called with a tag name, 
an attributes hash, and a children array.

    var div = E('div', {title: "I am a div"}, [children]);

Classes on an element are specified as a `className` attribute, whose value is created by the
CLASS routine, which takes a hash whose keys are camelized class names, with boolean values:

    var div = E('div', {className: CLASS({active: model.active})});

This approach allows various class names to be dynamically specified or removed 
by changing the value of the `model.active` property.

As shown above, text nodes are created using `TEXT`.

The third argument to `E`, which specifies an array of children, is dynamic, so:

    E('div', {}, model.items.map(i => E('span', {}, [TEXT(i.text)])))

This corresponds roughly to something like the below in a templating language:

    <div>
        {{#each model.items}}
            <span>text</span>
        {{/each}}
    </div>

and functions identically in the sense that changes to `model.items` are automatically reflected,
as are changes in the `test` property of items.

In-line styles are specified using the `style` attribute, as expected:

    E('div', {style: {backgroundColor: model.color}})

where again, any change to `model.color` will be reflected automatically.

### Defining your own upward-aware functions

### Writing HTML and CSS



