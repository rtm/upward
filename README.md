Upward
======

Upward is a JavaScript library with a declarative style.
You declare how things should be,
and it makes sure things are and stay that way.
All CSS and HTML is written in JavaScript as well,
so there's a single language to write, preprocess, and run.

### Introduction

In the development community's struggles to integrate the front-end technologies that have emerged
for mark-up, styling, and program logic, we have created a witches&rsquo; brew.
We have styles inside logic, logic inside styles,
logic inside mark-up, and mark-up inside logic.
We have build a tangled web of templating languages, libraries, frameworks,
and CSS preprocessors.
We have complex build systems to preprocess, precompile, and transpile this steaming mess.
We have monstrous config objects with mysterious properties fed to black box add-ons to control magic behaviors.
We build assumptions upon assumptions and dependencies upon dependencies.
All of this makes our systems hard to write, debug, maintain, build, and deploy.

In Upward, in contrast, everything is logic.
Mark-up and styling is all described by logic.
It is a purely JS, declarative world.

Upward is not a framework.
It is a library, a layer, a context for declaring the relationships among objects
and dynamically keeping them up to date.
Upward does not make any assumptions about what you want to do.
It is ultimately unopinionated.

### Basic architecture

The Upward framework is based around

 1. **Upwardables**, values which observe themselves

 1. **Upwardable functions**, both built-in and user-defined, which take and return upwardables

 1. **Upwardable objects**, whose properties are upwardables

Other features include:

 1. **Upwardable template strings**, which auto-update to reflect changes to upwardable placeholders

 1. **DOM Node creation Routines** such as `UpElement` and `UpText` which are based on upwardables, and thus auto-update themselves

 1. A broad selection of upward-aware **data manipulation functions** such as `map`.

 1. An API for defining **CSS**, which is also upward-aware and thus dynamically changeable

 1. A minimalistic, upward-aware **MVC framework**.

 1. **Utilities** such as timers.

 1. An upward-aware **test runner**.

### Project status

In progress, bleeding edge, changing frenetically, unusable.

### Environment

**Upward** is written completely in ES6 and targeted for compilation by babel.
The environment it runs in needs to support ES6 features such as `Map` and `Object.observe`.
It has been tested only in Chrome.
It will not run in other browsers due to their lack of support for `Object.observe`.

The recommended approach to bulding an app is to use browserify:

    browserify -t babelify main.js -o bundle.js

Then include the bundle and the babel browser polyfill in your HTML page:

```html
<script src="node_modules/babel-core/browser-polyfill.js"></script>
<script src="bundle.js"></script>
```

### Installation

    npm install --save-dev upward

You may now refer to upward modules from inside your app via:

    import {U} from 'upward';


### Building

There is nothing to build here, except the docs.


### Testing

Upward comes with extensive tests using its own testing harness.
This testing harness can also be used for testing Upward applications.
The tests are located in the separate [upward-test repo](https://www.github.com/rtm/upward-test).


### License

Copyright (c) 2014-2015 Bob Myers.

Licensed under the MIT license.


### Acronym

"Upward" is an acronym for "Upward Propagation With ARgument Detection", if you insist.
