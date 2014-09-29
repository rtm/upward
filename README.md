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

    var model = upwardifyProperties({ msg: "Hi, Bob." });
    document.body.appendChild(TEXT(model.msg));

    var button = BUTTON().event('click', function() {
        model.msg = "Hello, world.";
    });

`upwardifyProperties` arranges for the properties (in this case, `msg`)
to be upwarded to upward-aware functions to which they are passed,
such as `TEXT` in the following line.
So when the user presses the button, and changes the value of `model.msg`,
the display automatically updates itself.

### Template strings

Upward properties may also be used with ES6 string templates ("quasi-literals"):

    document.body.appendChild(TEXT(uts`I say, "${model.msg}".`));

The `uts` is a template string helper which "upwardizes" the property references within the template string.
 and automatically

### Defining your own upward-aware functions

### Writing HTML and CSS



