// Todo item model
// ===============

import {U} from '../../../src/Up';

export default function(title, completed) {
  title = title.trim();
  return U({title, completed});
}
