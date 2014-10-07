define("../src/upward", [], function() {
  "use strict";
  var __moduleName = "../src/upward";
  var $__6 = Object,
      create = $__6.create,
      keys = $__6.keys,
      assign = $__6.assign,
      defineProperty = $__6.defineProperty;
  var $__6 = document,
      createElement = $__6.createElement,
      createTextNode = $__6.createTextNode,
      createDocumentFragment = $__6.createDocumentFragment;
  var appendChild = Node.appendChild;
  var upwardConfig = {
    LOGGING: true,
    DEBUG: true
  };
  var id = 0;
  function configureUpwardable(opts) {
    assign(upwardConfig, opts);
  }
  function camelify(str) {
    return str.replace(/[-_][a-z]/g, (function(_, letter) {
      return letter.toUpperCase();
    }));
  }
  function dasherify(str) {
    return str.replace(/[a-z][A-Z]/, (function(let1, let2) {
      return let1 + let2.toLowerCase();
    }));
  }
  String.prototype.camelify = function() {
    return camelify(this);
  };
  String.prototype.dasherify = function() {
    return dasherify(this);
  };
  function laterify(fn) {
    var $__7;
    var $__6 = arguments[1] !== (void 0) ? arguments[1] : {},
        delay = ($__7 = $__6.delay) === void 0 ? 10 : $__7;
    return function() {
      var $__0 = arguments,
          $__1 = this;
      return setTimeout((function() {
        return fn.apply($__1, $__0);
      }), delay);
    };
  }
  function chainify(fn) {
    return function() {
      var $__9;
      for (var args = [],
          $__2 = 0; $__2 < arguments.length; $__2++)
        args[$__2] = arguments[$__2];
      ($__9 = fn).call.apply($__9, $traceurRuntime.spread([this], args));
      return this;
    };
  }
  function selfify(fn) {
    return function selfified() {
      fn.apply(this, arguments);
      return selfified;
    };
  }
  function memoify(fn) {
    var $__6,
        $__8;
    var $__7 = arguments[1] !== (void 0) ? arguments[1] : {},
        hash = ($__6 = $__7.hash) === void 0 ? (function(x) {
          return x;
        }) : $__6,
        cache = ($__8 = $__7.cache) === void 0 ? {} : $__8;
    function memoified() {
      var $__9;
      for (var args = [],
          $__2 = 0; $__2 < arguments.length; $__2++)
        args[$__2] = arguments[$__2];
      var key = hash.apply(null, $traceurRuntime.spread(args));
      return key in cache ? cache[key] : cache[key] = ($__9 = fn).call.apply($__9, $traceurRuntime.spread([this], args));
    }
    memoified.clear = (function() {
      return cache = {};
    });
    return memoified;
  }
  function objectToString(o) {
    return '{' + keys(o).map((function(k) {
      return (k + ": " + o[k]);
    })).join(', ') + '}';
  }
  function log() {
    var $__9;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    if (upwardConfig.LOGGING) {
      ($__9 = console).log.apply($__9, $traceurRuntime.spread(['UPWARDIFY:\t'], args));
    }
  }
  function valueOf(v) {
    return v == null ? v : v.valueOf();
  }
  function mapObject(o, fn, ctxt) {
    return keys(o).reduce((function(result, k) {
      return result[k] = fn.call(ctxt, o[k]);
    }), result);
  }
  function valueObject(o) {
    return mapObject(o, valueOf);
  }
  function valueArray(a) {
    return a.map(valueOf);
  }
  function objectValues(o) {
    return keys(o).map((function(k) {
      return o[k];
    }));
  }
  function makeUpwardableProperty(o, p) {
    return Upwardable(o[p], {
      o: o,
      p: p
    }).defineAsProperty(o, p);
  }
  function Upwardable(v) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    var upwards = arguments[2] !== (void 0) ? arguments[2] : [];
    console.assert("Cannot make upwardable out of upwardable", !isUpwardable(v));
    function toString() {
      return ("upwardable on " + objectToString(options));
    }
    var $__6 = options,
        once = $__6.once,
        later = $__6.later,
        disable = $__6.disable;
    var accessor = {
      get: function() {
        reporters[reporters.length - 1](u);
        return u;
      },
      set: function(nv) {
        if (!disable) {
          upwards.forEach((function(fn) {
            return fn(valueOf(nv), valueOf(v), u, options);
          }));
          v = nv;
          disable = once;
        }
      },
      enumerable: true
    };
    var u = assign(create(upwardablePrototype), {
      valueOf: function() {
        return valueOf(v);
      },
      upward: function(fn) {
        upwards.push(fn);
      },
      define: function(o, p) {
        return defineProperty(o, p, accessor);
      }
    });
    u.define(u, 'val');
    if (upwardConfig.DEBUG) {
      assign(u, {
        id: id,
        toString: toString
      });
      id++;
    }
    return u;
  }
  var reporters = [(function() {
    return undefined;
  })];
  var upwardablePrototype = {toUpperCase: function() {
      return computedUpwardable(function() {
        return valueOf(this).toUpperCase();
      }, this);
    }};
  function upwardReport(fn, reporter) {
    var result;
    reporters.push(reporter);
    result = fn();
    reporters.pop();
    return result;
  }
  function isUpwardable(u) {
    return u && typeof u === 'object' && u.upward;
  }
  function castUpwardable(u) {
    return isUpwardable(u) ? u : Upwardable(u);
  }
  function upward(o, fn) {
    return isUpwardable(o) && o.upward(fn);
  }
  function computedUpwardable(fn, ctxt) {
    fn = fn.bind(ctxt);
    reporters.push((function(udep) {
      return upward(udep, (function() {
        return u.val = fn();
      }));
    }));
    var u = Upwardable(fn());
    reporters.pop();
    return u;
  }
  function upwardify(fn) {
    var changefn = arguments[1] !== (void 0) ? arguments[1] : fn;
    return function(v) {
      upward(v, changefn.bind(this));
      return fn.call(this, valueOf(v));
    };
  }
  function upwardifyWithObjectParam(fn, changefn) {
    return function(o) {
      upwardifyProperties(o);
      keys(o).forEach((function(k) {
        return upward(o[k], (function(nv) {
          return changefn(k, nv);
        }));
      }));
      return fn.call(this, valueOfObject(o));
    };
  }
  function upwardifiedAssign(fn) {
    var $__0 = this;
    return upwardifyWithObjectParam((function(oo) {
      return assign(fn.call($__0), oo);
    }), (function(p, v) {
      return fn.call($__0)[p] = v;
    }));
  }
  function upwardifyProperty(o, p) {
    castUpwardable(o[p]).define(o, p);
    return o;
  }
  function upwardifyProperties(o) {
    if (!o.upwardified) {
      keys(o).forEach((function(k) {
        return upwardifyProperty(o, k);
      }));
      defineProperty(o, 'upwardified', {value: true});
    }
    return o;
  }
  function createElt(tagName) {
    var attrs = arguments[1] !== (void 0) ? arguments[1] : {};
    var children = arguments[2] !== (void 0) ? arguments[2] : [];
    var e = createElement(tagName);
    (children || []).forEach(appendChild, e);
    assign(e.attributes, attrs);
    return e;
  }
  var $__6 = Object,
      create = $__6.create,
      keys = $__6.keys,
      assign = $__6.assign;
  var EventListenerPrototype = {handleEvent: function(evt) {
      return this[evt.type](evt);
    }};
  EventTarget.prototype.on = function(handlers) {
    var $__0 = this;
    var listener = create(EventListenerPrototype);
    assign(listener, handlers, {context: this});
    keys(handlers).forEach((function(evt_type) {
      return $__0.addEventListener(evt_type, listener);
    }));
    return this;
  };
  var compose = (function(strings) {
    var $__9;
    for (var values = [],
        $__3 = 1; $__3 < arguments.length; $__3++)
      values[$__3 - 1] = arguments[$__3];
    values.push('');
    return ($__9 = []).concat.apply($__9, $traceurRuntime.spread(strings.map((function(e, i) {
      return [e, values[i].valueOf()];
    }))));
  });
  var upwardifyTemplate = (function(strings) {
    for (var values = [],
        $__4 = 1; $__4 < arguments.length; $__4++)
      values[$__4 - 1] = arguments[$__4];
    return computedUpwardable((function() {
      return compose.apply(null, $traceurRuntime.spread([strings], values));
    }), values);
  });
  var upwardifyTemplateFormula = (function(strings) {
    for (var values = [],
        $__5 = 1; $__5 < arguments.length; $__5++)
      values[$__5 - 1] = arguments[$__5];
    return computedUpwardable((function() {
      return eval(compose.apply(null, $traceurRuntime.spread([strings], values)));
    }), values);
  });
  ;
  return {
    get Upwardable() {
      return Upwardable;
    },
    get computedUpwardable() {
      return computedUpwardable;
    },
    get upwardifyProperties() {
      return upwardifyProperties;
    },
    get valueOf() {
      return valueOf;
    },
    get upwardifyTemplate() {
      return upwardifyTemplate;
    },
    get upwardifyTemplateFormula() {
      return upwardifyTemplateFormula;
    },
    get createElt() {
      return createElt;
    },
    get isUpwardable() {
      return isUpwardable;
    },
    get upward() {
      return upward;
    },
    get upwardify() {
      return upwardify;
    },
    get configureUpwardable() {
      return configureUpwardable;
    },
    get chainify() {
      return chainify;
    },
    __esModule: true
  };
});
define("../src/dom", ['./upward'], function($__10) {
  "use strict";
  var __moduleName = "../src/dom";
  if (!$__10 || !$__10.__esModule)
    $__10 = {default: $__10};
  var $__11 = $__10,
      Upwardable = $__11.Upwardable,
      upwardify = $__11.upwardify,
      chainify = $__11.chainify;
  var $__12 = document,
      createTextNode = $__12.createTextNode,
      createElement = $__12.createElement;
  var $__12 = HTMLElement.prototype,
      appendChild = $__12.appendChild,
      replaceChild = $__12.replaceChild,
      setAttribute = $__12.setAttribute;
  Object.assign(HTMLElement.prototype, {
    child: upwardify(chainify(appendChild), replaceChild),
    attr: upwardify(chainify(setAttribute), setAttribute)
  });
  Object.assign(Node.prototype, {
    value: upwardify(chainify(function(v) {
      this.nodeValue = v || "";
    })),
    toValue: function() {
      return this;
    }
  });
  var INPUT = function() {
    var input = document.createElement('input');
    var propname = (function(evt_type) {
      return ("val_" + evt_type);
    });
    var handler = {handleEvent: function(evt) {
        input[propname(evt.type)] = input.value;
      }};
    ['input', 'change'].forEach((function(evt_type) {
      input.addEventListener(evt_type, handler);
      Upwardable("").define(input, propname(evt_type));
    }));
    return input;
  };
  var BUTTON = function() {
    return document.createElement('button');
  };
  var DIV = function() {
    return document.createElement('div');
  };
  var TEXT = function(text) {
    return document.createTextNode("").value(text);
  };
  String.prototype.reverse = function() {
    return this.split().reverse().join('');
  };
  ['concat', 'replace', 'slice', 'substr', 'substring', 'toUpperCase', 'toLowerCase', 'toLocaleUpperCase', 'toLocaleLowerCase', 'trim', 'trimLeft', 'trimRight', 'revese'].forEach((function(method) {
    return Text.prototype[method] = function() {
      return this.nodeValue = String.prototype[method].apply(this.nodeValue, arguments);
    };
  }));
  ;
  ['charAt', 'charCodeAt', 'indexOf', 'lastIndexOf', 'match', 'search', 'split'].forEach((function(method) {
    return Text.prototype[method] = function() {
      return String.prototype[method].apply(this.nodeValue, arguments);
    };
  }));
  ;
  ;
  return {
    get INPUT() {
      return INPUT;
    },
    get BUTTON() {
      return BUTTON;
    },
    get DIV() {
      return DIV;
    },
    get TEXT() {
      return TEXT;
    },
    __esModule: true
  };
});
define("../src/U", ['./upward', './dom'], function($__13,$__14) {
  "use strict";
  var __moduleName = "../src/U";
  if (!$__13 || !$__13.__esModule)
    $__13 = {default: $__13};
  if (!$__14 || !$__14.__esModule)
    $__14 = {default: $__14};
  var $___46__46__47_src_47_upward__ = $__13;
  var $___46__46__47_src_47_dom__ = $__14;
  return {
    get U() {
      return $___46__46__47_src_47_upward__.Upwardable;
    },
    get C() {
      return $___46__46__47_src_47_upward__.computedUpwardable;
    },
    get P() {
      return $___46__46__47_src_47_upward__.upwardifyProperties;
    },
    get V() {
      return $___46__46__47_src_47_upward__.valueOf;
    },
    get S() {
      return $___46__46__47_src_47_upward__.upwardifyTemplate;
    },
    get S$() {
      return $___46__46__47_src_47_upward__.upwardifyTemplateFormula;
    },
    get E() {
      return $___46__46__47_src_47_upward__.createElt;
    },
    get INPUT() {
      return $___46__46__47_src_47_dom__.INPUT;
    },
    get BUTTON() {
      return $___46__46__47_src_47_dom__.BUTTON;
    },
    get DIV() {
      return $___46__46__47_src_47_dom__.DIV;
    },
    get TEXT() {
      return $___46__46__47_src_47_dom__.TEXT;
    },
    __esModule: true
  };
});
define("string_test", ['../src/U'], function($__15) {
  "use strict";
  var __moduleName = "string_test";
  if (!$__15 || !$__15.__esModule)
    $__15 = {default: $__15};
  var P = $__15.P;
  var expect = chai.expect;
  describe('#null test', function() {
    it('maintains basic Boolean symmetry', function() {
      expect(1).to.equal(1);
    });
  });
  return {};
});
