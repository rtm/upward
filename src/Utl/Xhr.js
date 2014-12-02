var {assign} = Object;

function XHR(url, options = {}) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    assign(req, options);
    req.open('GET', url);

    req.onload = function() {
      if (req.status == 200) resolve(req.response);
      else reject(Error(req.statusText));
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.send();
  });
}

export default XHR;
