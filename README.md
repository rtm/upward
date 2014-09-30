Upward is a JavaScript framework for synchronizing data through your application. It works by introducing an `Upwardable` object which represents the watched state of an object, and `upwardified` functions which take upwardable objects and know how to re-invoke themselves when they change.

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

		import {P} from 'upward';
    import {TEXT, BUTTON} from 'dom';

    var model = P({ msg: "Hi, Bob." });
    document.body.appendChild(TEXT(model.msg));

    var button = BUTTON().event('click', function() {
        model.msg = "Hello, world.";
    });

`P` (for "properties") arranges for the properties (in this case, `msg`)
to be upwarded to upward-aware functions to which they are passed,
such as `TEXT` in the following line.
So when the user presses the button, and changes the value of `model.msg`,
the display automatically updates itself.

For conciseness, many upward functions are single uppercase letters.
If you prefer, you many import them under any alternative name you want.

### Template strings

Upward properties may also be used with ES6 string templates ("quasi-literals"):

    import {S} from 'upward';     
    document.body.appendChild(TEXT(S`I say, "${model.msg}".`));

The `S` is a template string helper which "upwardizes" the property references within the template string
(surrounded in backticks)..
THe content of the text mode is automatically updated whenever the property changes.

### Computed functions

We can define computed values which are automatically updated when their inputs change:

    import {C} from 'upward';
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

### Defining your own upward-aware functions

### Writing HTML and CSS



