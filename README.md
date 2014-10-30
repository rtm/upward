Upward is a JavaScript framework where you declare how things should be,
and it makes sure things are like that and stay that way.
With upward, JavaScript becomes a "declarative", rather than an "imperative" language.
Upward is an all-JavaScript framework, so all your CSS and HTML is written in JavaScript as well.

### Introduction

In its struggles to integrate the front-end technologies that have been developed
for mark-up, styling, and program logic, the computing community has ended up with a witches brew.
We have mark-up languages with half-baked logic (templates) and 
CSS pre-processors like LESS providing their own programming constructs.
We have ended up with styles inside logic, logic inside styles,
logic inside mark-up, and mark-up inside logic, 
or even logic and styles inside mark-up inside logic.
We have build a tangled web of templating languages, libraries, frameworks, 
and CSS preprocessors.
We have complex build systems to preprocess, precommpile, and transpile this steaming mess.
We have monstrous config files fed to black box add-ons which do magical stuff.
In the name of "convention over configuration",
we have build monolithic frameworks that work great--until you move past toy systems.

All of this makes our systems hard to write, debug, and maintain, and complicated and slow to build.
In Upward, in contrast, everything is logic.
Mark-up and styling is all described by logic.
It is a purely JS, declarative world.

Upward is not an MVC framework, nor a library.
It is a context for declaring objects and transformations and dynamically keeping them up to date.
Upward does not make any assumptions about what you want to do.
It is ultimately unopinionated.

### Hello, World

    pieces   = ['Hello, ', 'World'];
    children = pieces.as(TEXT(;
    dom      = R('div', {}, children);
    document.body.appendChild(dom);

`as` formats the array as DOM text nodes to be placed as children to the `div`.
`R` <u>r</u>enders a DOM element.

As mentioned above, this is declarative, not procedural. For instance:

    model    = {name: 'World'};
    pieces   = ['Hello, ', model.name];
    children = pieces.as(TEXT(;
    dom      = R('div', {}, children);
    document.body.appendChild(dom);

works as above, but now

    model.name = 'Universe';

automatically updates the DOM representation, with no further ado.

We could also do

    pieces.push(' and how are you');

And the DOM is also automatically updated.

This model of programming is sometimes called "reactive".
    
### Project status

Raw, bleeding edge.

### Environment

Upward is written completely in ES6 and targeted for compilation by Traceur.
The environment it runs in needs to support ES features such as `Map`.
It has been tested only in Chrome, but has a reasonable chance of running in FF or IE11.
At present, we recommend including the traceur compiler and runtime in your web page:

```html
<script src="https://google.github.io/traceur-compiler/bin/traceur.js"></script>
<script src="https://google.github.io/traceur-compiler/src/bootstrap.js"></script>
<script>traceur.options.experimental = true;</script>
```

### Installation

    npm install upward

Upward has no dependencies, although you should install docco globally to create documentation.

### License

Copyright (c) 2014 Bob Myers.

Licensed under the MIT license.

### Acronym

"Upward" is an acronym for "Upward Propagation With ARgument Detection", if you insist.
