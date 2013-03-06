
/**
 * Module dependencies.
 */

var adapter = require('tower-adapter')
  , container = require('tower-container')
  , model = require('tower-model')
  , strcase = require('tower-strcase')
  // XXX: strip out pluralize/singularize into single
  //      function components.
  , inflection = require('inflection')
  , MemoryAdapter = adapter('memory');

/**
 * Expose `MemoryAdapter`.
 */

module.exports = MemoryAdapter;

MemoryAdapter
  .type('string');

MemoryAdapter.prototype.initialize = function(){
  if (this.initialized) return;
  this.recordsByType = {};
  this.initialized = true; // XXX: tmp hack
}

/**
 * Parse the `criteria` object and execute.
 *
 * @param {Array}     criteria
 * @param {Function}  fn
 * @api public
 */

MemoryAdapter.prototype.execute = function(criteria, fn){
  this.initialize();
  // assuming for now that all criteria start with ['start', collectionName]
  // and end with an action. Then, all intermediate criterion are conditions.
  // XXX: will expand in a bit.

  var action = criteria[criteria.length - 1];

  this[action[1]](criteria, fn);
}

MemoryAdapter.prototype.insert = function(criteria, fn){
  var start = criteria[0];
  var Model = model(inflection.singularize(start[1]));

  fn(null, this.recordsByType[0] = criteria.pop()[2]);
}