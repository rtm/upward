// Create text node (Txt)
// ======================

import { Observable } from 'rxjs/Observable';
import { Any$ } from './types';

export function Txt(nodeValue$: Any$): Text {
  const node = document.createTextNode("");

  nodeValue$.subscribe(nodeValue => node.nodeValue = nodeValue + '');

  return node;
}
