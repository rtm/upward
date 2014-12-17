Coding style
============

Upward uses the following coding style. Whether or not you adopt this in your Upward application is completely up to you.

1. Two-space indents

1. camelCased variable names

1. Liberal double-slash comments, at least one per routine. Double-slash comments at beginning of every file

1. Short `if` and `else` statement bodies may follow on the same line, with no curly brackets

1. Individual `var` declarations

1. Empty lines between routines, and wherever else makes sense for readability

1. No spaces after left parentheses or before right parentheses

1. Single spaces after left brackets and before right brackets, both for single-line functions and object literals

1. Spaces around operators

1. Short (usually one-statement) function bodies on a single line

1. Spaces before and after dots accessing chained methodsd, such as `E('div') . has(....)`. When the `has` is to be placed on a separate line, the preceding period on the first line

1. Use of spacing to align and show the relationship between consecutive lines, as in

        foo     .forEach(fooFunc);
        otherFoo.forEach(otherFooFunc);