
/**
 * Module dependencies.
 */

var adapter = require('tower-adapter')
  , topology = require('tower-topology')
  , action = require('tower-stream')
  , filter = require('tower-filter')
  , validate = require('tower-validate')
  , optimizer = require('tower-query-optimizer');

/**
 * Expose `memory` adapter.
 */

exports = module.exports = adapter('memory');

/**
 * Collections by name.
 */

exports.collections = {};

/**
 * Adapter data types.
 */

exports
  .type('string')
  .type('text')
  .type('date')
  .type('float')
  .type('integer')
  .type('number')
  .type('boolean')
  .type('bitmask')
  .type('array');

/**
 * Find records.
 */

action('memory.find', find);

/**
 * Create records.
 */

action('memory.create', create);

/**
 * Update records.
 */

action('memory.update', update);

/**
 * Remove records.
 */

action('memory.remove', remove);

/**
 * Execute a database query.
 */

exports.exec = function(query, fn){
  var topology = optimizer.topology('memory', query.criteria);

  process.nextTick(function(){
    topology.exec(fn);
  });

  return topology;
}

/**
 * Connect.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.connect = function(name, fn){
  if (fn) fn();
}

/**
 * Disconnect.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.disconnect = function(name, fn){
  if (fn) fn();
}

/**
 * Create a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.create = function(name, fn){
  return exports.collections[name] = [];
}

/**
 * Update a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.update = function(name, fn){

}

/**
 * Remove a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.remove = function(name, fn){
  delete exports.collections[name];
  return exports;
}

/**
 * Find a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.find = function(name, fn){
  return exports.collections[name];
}

function collection(name) {
  return exports.collections[name] || (exports.collections[name] = []);
}

function find(ctx, data, fn) {
  var records = collection(ctx.collectionName.model)
    , constraints = ctx.constraints;

  if (constraints.length) {
    ctx.emit('data', filter(records, constraints));
  } else {
    // optimized case of no query params
    ctx.emit('data', records);
  }
  
  fn();
}

function create(ctx, data, fn) {
  var records = collection(ctx.collectionName.model)
    , constraints = ctx.constraints;

  // XXX: generate uuid
  records.push.apply(records, ctx.data);
  ctx.emit('data', ctx.data);
  fn();
}

function update(ctx, data, next) {
  var records = collection(ctx.collectionName)
    , data = ctx.data
    , constraints = ctx.constraints;

  // XXX: or `isBlank`
  // if (!data)

  if (constraints.length)
    records = filter(records, constraints);

  // XXX: this could be optimized to just iterate once
  //      by reimpl part of `filter` here.
  // XXX: or maybe there is a `each-array-and-remove` that
  // is a slightly different iteration pattern so you can
  // remove/modify items while iterating.
  for (var i = 0, n = records.length; i < n; i++) {
    // XXX: `merge` part?
    for (var key in data) records[i][key] = data[key];
  }

  ctx.emit('data', records);
}

function remove(ctx, data, fn) {
  var records = collection(ctx.collectionName)
    , constraints = ctx.constraints;

  var result = [];

  if (constraints) {
    var i = records.length;

    while (i--) {
      if (validate(records[i], constraints)) {
        result.unshift(records.splice(i, 1)[0]);
      }
    }
  }

  ctx.emit('data', result);
  fn();
}