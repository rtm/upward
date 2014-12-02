Upward is a JavaScript framework where you declare how things should be,
and it makes sure things are like that and stay that way.
With Upward, JavaScript becomes a "declarative", rather than an "imperative" language.
In Upward, all your CSS and HTML is written in JavaScript as well,
so there's a single language to write, preprocess, and run.

### Introduction

In its struggles to integrate the front-end technologies that have been developed
for mark-up, styling, and program logic, the computing community has ended up with a witches brew.
We have ended up with styles inside logic, logic inside styles,
logic inside mark-up, and mark-up inside logic, 
or even logic and styles inside mark-up inside logic.
We have build a tangled web of templating languages, libraries, frameworks, 
and CSS preprocessors.
We have complex build systems to preprocess, precommpile, and transpile this steaming mess.
We have monstrous config objects with mysterious properties fed to black box add-ons which do magical stuff.

All of this makes our systems hard to write, debug, and maintain, and complicated and slow to build.
In Upward, in contrast, everything is logic.
Mark-up and styling is all described by logic.
It is a purely JS, declarative world.

Upward is not an MVC framework, nor a library.
It is a context for declaring objects and transformations and dynamically keeping them up to date.
Upward does not make any assumptions about what you want to do.
It is ultimately unopinionated.

### Basic architecture

The upward library is based around

 1. **Upwardables**, which are objects that know how to notify changes to themselves

 1. **Upwardable functions**, which take and return upwardables, both built-in and user-defined
 
 1. **Upwardable objects**, whose properties are upwardables

Other features include:

 1. **Upwardable template strings**, which auto-update to reflect changes to upwardable placeholders

 1. Routines such as `UpElement` and `UpText` which create DOM nodes based on upwardables, and thus auto-update themselves

 1. A broad selection of upward-aware **data manipulation functions** such as `map`.

 1. APIs for defining **CSS**, which are also upward-aware and thus dynamically changeable

 1. **Utilities** such as timers.

### Project status

In progress, unusable.

### Environment

**Upward** is written completely in ES6 and targeted for compilation by Traceur.
The environment it runs in needs to support ES6 features such as `Map` and 'Object.observe'.
It has been tested only in Chrome.
It will not run in other browsers due to their lack of support for `Object.observe`.

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
