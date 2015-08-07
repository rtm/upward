// MVC
// ===

// The Upward MVC system is not a framework,
// but rather a set of concepts and recommendations and minimal sugar.
// For more information, see doc/Mvc.md.

import C from './Fun';
var createElement = document.createElement.bind(document);

/**
 * ## makeView
 *
 * Return a view-maker from view and controller functions.
 *
 * @param {Function} view function to create view
 * @param {Function} controller function to create controller
 * @return {Function} function to create view against model
 */

function makeView(view, controller) {
  return (model, parent) => view(model, controller(model, parent));
}

/**
 * ## makeElementViews
 *
 * Return an array of views for elements of an array-valued model.
 *
 * @param {Object} model model to create element views for
 * @param {Function} view view to use for elements
 * @param {Function} controller function to create item controller
 * @param {Controller} parent parent controller to use for item controllers
 */

function makeElementViews(model, view, controller, parent) {
  return model . as(model => makeView(model, view, controller, parent));
}

// Exports
export { makeView, makeElementViews };
