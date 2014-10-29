Upward is a JavaScript framework where you declare how things should be,
and it makes sure things are like that and stay that way.
With upward, JavaScript becomes a "declarative", rather than an "imperative" language.
Upward is an all-JavaScript framework, so all your CSS and HTML is written in JavaScript as well.

"Upward" is an acronym for "Upward Propagation With ARgument Detection", if you insist.

### Introduction

In its struggles to integrate the technologies that have been developed
for mark-up, styling, and program logic, the computing community has come up with a witches brew of mixed-modes.
These include mark-up slipped into programs, programs treating mark-up as strings,
CSS pre-processors like LESS providing their own programming constructs,
and mark-up languages with built-in logic (templates).
We have ended up with styles inside logic, logic inside styles,
logic inside mark-up, and mark-up inside logic.
In ridiculous cases, we have logic and styles inside mark-up inside logic.
We have build a tangled web of templating languages, libraries like jQuery,
and CSS preprocessors.
We have monstrous config files fed to black box add-ons which do magical stuff.
They make our systems hard to write, debug, and maintain, and complicated and slow to build.

In Upward, in contrast, everything is logic.
Mark-up and styling is all described by logic.
It is a purely JS world.

Upward is not an MVC framework, nor a library.
It is a context for declaring objects and transformations and dynamically keeping them up to date.
Its power obviates much of the need for MVC concepts.
Upward does not make any assumptions about what you want to do.
It is ultimately unopinionated.

### Hello, World

    document.body.appendChild(R('div', {}, ['Hello', 'Bob'].as(TEXT)));

`R` <u>r</u>enders a DOM element.
`as` formats the array as DOM text nodes placed as children to the `div`.

As mentioned above, this is declarative, not procedural. For instance:

    model = {name: 'Bob'}
    document.body.appendChild(R('div', {}, ['Hello', model.name].as(TEXT)));

works as above, but now

    model.name = 'Hrishi';

automatically changes the DOM representation, with no further ado.
This model of programming is sometimes called "reactive".
    
### Project status

Raw, bleeding edge.

### Environment

Upward is written completely in ES6 and targeted for compilation by Traceur.
The environment it runs in needs to support ES features such as `Map`.
It has been tested only in Chrome, but has a reasonable chance of running in FF or IE11.
At present, we recommend including the traceur compiler and runtime in your web page:

    <script src="https://google.github.io/traceur-compiler/bin/traceur.js"></script>
    <script src="https://google.github.io/traceur-compiler/src/bootstrap.js"></script>
    <script>traceur.options.experimental = true;</script>

### Installation

`npm install upward`.

Upward has no dependencies, although you should install docco globally to create documentation.

### Testing

Upward uses its own testing framework, with chai assertions.
See any file in the `tests` directory for examples.
To run tests, open `tests/index.html`, or run `npm test`.

### Formatting

Standard JS formatting, with the exceptions that:

* Short if and for blocks may be placed on one line for compactness.
* Use of spaces to align analogous code structures on adjacent lines is encouraged.


