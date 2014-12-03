import {U, T} from '../src/Up';
import XHR from '../src/Utl/XHR';

var get, dom, data;

//===START
data = U({repo: 'rtm/upward'});

function getGithubEvents(repo) {
  return XHR(
    `https://api.github.com/repos/${repo}/events`,
    { responseType: 'json' });
}
             
get = Up(function(repo) {
  return getGithubEvents(repo)
    .then (json => json[0].payload.commits[0].message)
    .catch(_    => Error("There was a problem with the request"));
});

dom = T(get(data.repo));
//===END

export default dom;
