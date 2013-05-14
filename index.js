
/**
 * Module dependencies.
 */

var adapter = require('tower-adapter')
  , stream = require('tower-stream')
  , query = require('tower-query');

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

stream('memory.find', find);

/**
 * Create records.
 */

stream('memory.create', create);

/**
 * Update records.
 */

stream('memory.update', update);

/**
 * Remove records.
 */

stream('memory.remove', remove);

/**
 * Execute a database query.
 */

exports.exec = function(query, fn){
  var program = stream('memory' + '.' + query.type).create({
    collectionName: query.selects[0],
    query: query
  });

  // XXX: process.nextTick
  program.on('data', function(records){
    fn(null, records);
  });

  program.exec();

  return program;
}

/**
 * Load data.
 */

exports.load = function(key, val){
  if ('object' === typeof key) {
    for (var _key in key)
      exports.load(_key, key[_key]);
  } else {
    var collection = exports.find(key) || exports.create(key);
    collection.push.apply(collection, val);
  }

  return exports;
}

/**
 * Reset everything.
 */

exports.clear = function(){
  // XXX: should be more robust.
  exports.collections = {};
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

exports.collection = function(name){
  return exports.find(name) || exports.create(name);
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
    , constraints = ctx.query.constraints;

  if (constraints.length) {
    records = query.filter(records, constraints)
  } else {
    records = records.concat();
  }

  // XXX: sort
  // https://github.com/viatropos/tower/blob/master/packages/tower-support/shared/array.coffee
  //records = records.sort(function(a, b){
  //  a.id < b.id
  //});

  // limit
  if (ctx.query.paging.limit) records.splice(ctx.query.paging.limit);
  
  ctx.emit('data', records);
  
  fn();

  ctx.close();
}

function create(ctx, data, fn) {
  var records = collection(ctx.collectionName.model)
    , constraints = ctx.query.constraints;

  // XXX: generate uuid
  records.push.apply(records, ctx.query.data);
  ctx.emit('data', ctx.query.data);
  fn();
  ctx.close();
}

function update(ctx, data, fn) {
  var records = collection(ctx.collectionName.model)
    , data = ctx.query.data && ctx.query.data[0] // XXX: refactor
    , constraints = ctx.query.constraints;

  // XXX: or `isBlank`
  // if (!data)

  if (constraints.length)
    records = query.filter(records, constraints);

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
  fn();
  ctx.close();
}

function remove(ctx, data, fn) {
  var records = collection(ctx.collectionName.model)
    , constraints = ctx.query.constraints;

  var result = [];

  if (constraints) {
    var i = records.length;

    while (i--) {
      if (query.validate(records[i], constraints)) {
        result.unshift(records.splice(i, 1)[0]);
      }
    }
  }

  ctx.emit('data', result);
  fn();
}