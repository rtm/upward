// Todo item view
// ==============

import {E, T, H1, P, A} from '../../../src/Up';

// Make DOM for a todo item.
export default function todoView(item) {
  return E('li') .
    is({ class: { completed: item.completed, editing: item.editing} }) .
    has([

      E('div#view') . has ([
        E('input') . is({type: 'checkbox'}) . does({click: 0}) . sets(item.complete),
        LABEL(item.title) . does({ doubleclick: edit })
      ]),
      
      E('input.edit') . sets(item.title) . does({ blur: doneediting })
    ])
  ;
}
