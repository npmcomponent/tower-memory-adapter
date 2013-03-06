
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
  //this.recordsByType = {};
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

var operations = {};

// XXX: tower-operator module
operations['string.eq'] = function(a, b){
  return a === b;
}

function operation(type, operator, a, b){
  return operations[type + '.' + operator](a, b);
}

MemoryAdapter.prototype.query = function(criteria, fn){
  var type = criteria[0][1]
    , collection = this.recordsByType[type]
    , result = []
    , condition
    , attrs = model(inflection.singularize(type)).attrs
    , record;

  for (var i = 1, n = collection.length - 1; i < n; i++) {
    record = collection[i];
    for (var j = 1, m = criteria.length - 1; j < m; j++) {
      // [ 'condition', 'eq', 'title', 'two' ]
      condition = criteria[j];
      // XXX: need to get field type from schema.
      var attrType = attrs[condition[2]].type;
      // XXX: this isn't correct yet, only accounts for one condition.
      if (operation(attrType, condition[1], record[condition[2]], condition[3]))
        result.push(record);
    }
  }

  fn(null, result);
}