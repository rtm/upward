"use strict";
// Create text node (Txt)
// ======================
exports.__esModule = true;
function Txt(nodeValue$) {
    var node = document.createTextNode("");
    nodeValue$.subscribe(function (nodeValue) { return node.nodeValue = nodeValue + ''; });
    return node;
}
exports.Txt = Txt;
