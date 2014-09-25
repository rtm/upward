/* jshint esnext: true */

var {defineProperty, create, keys, defineProperties} = Object;
var {createTextNode, createElement} = document;
var {join} = Array;

var valueOf = v => v.valueOf();

function _this() { return this; }

Object.prototype.map = function (fn) {
	return keys(this).reduce((result, k) => (result[k] = fn(this[k], k, this), result), {});
};

//Object.prototype.valueOf = function() {	return this.map(valueOf); };
//RegExp.prototype.valueOf = Date.prototype.valueOf = _this;

var chainify = fn => function() { fn.apply(this, arguments); return this; };

export function Upwardable(v) {
	if (isUpwardable(v)) { return v; }

	var upwards       = [];

	var valueOf       = () => v === null || v === undefined ? v : v.valueOf();
	var set           = nv => { send_upwards(nv); v = nv; return this; };
	var get           = () => ret;

	var upward        = upward => { upwards.push(upward); };
	var ununpward     = function() { return this; };
	var send_upwards  = nv => upwards.forEach(fn => fn(nv.valueOf(), v.valueOf()));

	var ret           = {get, set, valueOf, upward};
 
    var onward        = function(f, ...args) {
		function go() {	return f.apply(this.valueOf(), ...args); }
		upward(go);
		return go();
	};
	
	return ret;
};

function upwardablePropertyDescriptor(val) {
	var {get, set} = Upwardable(val);
	return { get, set, enumerable: true };
}

function defineUpwardableProperty(obj, prop, val) {
	return isUpwardable(val) ? val : defineProperty(obj, prop, upwardablePropertyDescriptor(val));
}

export var isUpwardable = x => x && typeof x === 'object' && x.upward;

var upward = (o, fn) => o.upward && o.upward(fn);


export function upwardify(fn, changefn = fn) {
	return function(v) {
		upward(v, changefn.bind(this));
		return fn.call(this, v.valueOf());
	};
}

export function createUpwardableObject(o) {
	return defineProperties({}, keys(o).reduce((result, k) => {
		result[k] = upwardablePropertyDescriptor(o[k]);
		return result;
	}, {}));
}

/** testing
function upwardArray(a) {
	var w = Upwardable(a);
	a.forEach(elt => upward(elt, () => w.set(Array(a))));
	return w;
}
*/

var joiner = delimiter => function() { return join.call(this, delimiter); };

export var upwardableTextNode = upwardify(
	createTextNode.bind(document),
	function(text) {this.nodeValue = text;}
);

var {appendChild, replaceChild, setAttribute} = HTMLElement.prototype;

Object.assign(HTMLElement.prototype, {
	child: upwardify(chainify(appendChild), replaceChild),
	attr: upwardify(chainify(setAttribute), setAttribute)
});

Object.assign(Node.prototype, {
    value: upwardify(chainify(function(v) { this.nodeValue = v || ""; })),
	toValue: _this
});

CSSStyleSheet.prototype.replaceRule = function(rule, idx) {
	this.deleteRule(idx);
	return this.insertRule(rule, idx);
};

export var INPUT = function() {
	debugger;
	var input = document.createElement('input');
	defineUpwardableProperty(input, 'val', "");
	input.addEventListener('change', function() { input.val = input.value; });
	return input;
};

export var BUTTON = function() {
	return document.createElement('button');
};

Node.prototype.toValue = _this;

export var DIV = function() {
 	return document.createElement('div');
 };

export var TEXT = function(text) {
	return document.createTextNode("").value(text);
};

