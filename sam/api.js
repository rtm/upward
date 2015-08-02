import {U, T, C} from '../src/Up';
import XHR from '../src/Utl/Xhr';

var get, dom, data;

//===START
data = U({repo: 'rtm/upward'});

function getGithubEvents(repo) {
  return XHR(
    `https://api.github.com/repos/${repo}/events`,
    { responseType: 'json' });
}

get = C(function(repo) {
  return getGithubEvents(repo)
    .then(json => console.log(json[0]))
    .then(json => json[0].payload.commits[0].message)
    .catch(_    => Error("There was a problem with the request" + _));
});

dom = T(get(data.repo));
//===END

export default dom;
