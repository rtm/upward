// Counter as computable.
// ======================

// Is this even necessary?
// TODO: add Obsevable.timer-like functionality.

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';

import { Number$ } from './types';

export function Cnt(ms: number = 1000): Number$ {
  return Observable.interval(ms);
}
