import {U, T, C} from '../src/Up';

var dom, data;

//===START
data = new Promise(
  resolve => setTimeout(_ => resolve("Hi, Bob."), 2000)
);

var view = C(_ => data, document.createElement('div'));

data = U({repo: 'rtm/upward'});

dom = view();
//===END

export default dom;
