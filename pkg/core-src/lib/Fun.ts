// Upwardable Functions
// ====================

// The **upwardable function** is one of the two key components of the upward library,
// along with the **upwardable object**.
// An **upwardable function** is an enhanced function which recomputes itself
// when its inputs or dependencies change.
// Inovking an upwardable function results in a **upwardable**, which holds the value.
// An upwardable is always an object; if primitive, it is wrapped.

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// Create a function that maps an observable.
export function Fun<T, R>(project: (value: T, index: number) => R) {
  return function($: Observable<T>): Observable<R> {
    return $.map(project);
  };
}
