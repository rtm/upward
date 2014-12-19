Coding style
============

Upward uses the following coding style. Whether or not you adopt this in your Upward application is completely up to you.

1. Indentation
 * Two spaces
 * Spaces, not tabs
1. Variables and names
 * camelCased
 * Individual `var` declarations
 * `var` declarations after nested functions
1. Comments
 * Liberal double-slash comments, at least one per routine
 * Double-slash comments at beginning of every file
 * Use of YUIDoc-style comments for important APIs whose parameters/return value need explicit documentation
1. Line breaking
 * Short `if`, `else`, `for` and `while` statement bodies may follow on the same line, with no curly brackets
 * Short function bodies may also follow on the same line
1. Vertical spacing
 * Empty lines between routines, unless closely paired
 * Wherever else makes sense for readability
1. Horizontal spacing
 * No spaces after left parentheses or before right parentheses
 * Spaces around operators
 * Spaces after left brackets and before right brackets, both for single-line functions and object literals
 * Spaces before and after dots accessing chained methods, such as `E('div') . has(....)`; when the `has` is to be placed on a separate line, the preceding period on the first line
 * Spacing to align and show the relationship between consecutive lines, as in
1. Exports
 * At bottom
 * Preference for default exports
