
/**
 * Module dependencies.
 */

var adapter = require('tower-adapter');
var resource = require('tower-resource');
var stream = require('tower-stream');
var query = require('tower-query');
var uuid = require('tower-uuid');

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
};

/**
 * Load data.
 */

exports.load = function(name, val){
  if ('object' === typeof name) {
    for (var key in name)
      exports.load(key, name[key]);
  } else {
    var collection = exports.find(name) || exports.create(name);
    for (var i = 0, n = val.length; i < n; i++) {
      collection.push(identify(val[i], name))
    }
  }

  return exports;
};

/**
 * Reset everything.
 */

exports.clear = function(){
  // XXX: should be more robust.
  exports.collections = {};
};

exports.collection = function(name){
  return exports.find(name) || exports.create(name);
};

/**
 * Create a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.create = function(name, fn){
  return exports.collections[name] = [];
};

/**
 * Update a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.update = function(name, fn){

};

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
};

/**
 * Find a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.find = function(name, fn){
  return exports.collections[name];
};

function collection(name) {
  return exports.collections[name] || (exports.collections[name] = []);
}

function find(ctx, data, fn) {
  var records = collection(ctx.collectionName.resource)
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
  var name = ctx.collectionName.resource;
  var records = collection(name)
    , constraints = ctx.query.constraints;

  for (var i = 0, n = ctx.query.data.length; i < n; i++) {
    records.push(ctx.query.data[i] = identify(ctx.query.data[i], name));
  }

  ctx.emit('data', ctx.query.data);
  fn();
  ctx.close();
}

function update(ctx, data, fn) {
  var records = collection(ctx.collectionName.resource)
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
    // for (var key in data) records[i][key] = data[key];
    for (var key in data) records[i].set(key, data[key]);
  }

  ctx.emit('data', records);
  fn();
  ctx.close();
}

function remove(ctx, data, fn) {
  var records = collection(ctx.collectionName.resource)
    , constraints = ctx.query.constraints;

  var result = [];

  if (constraints.length) {
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

/**
 * Create a hidden `__id__` on `record`,
 * so it can be stored in memory by id.
 */

function identify(record, name) {
  // XXX: refactor. maybe adapters allow raw objects (not resources)
  // used for storing in memory on the client.
  if (!resource.is(record))
    record = resource(name).init(record);

  if (null == record.__id__) {
    record.__id__ = (record.get ? record.get('id') : record.id) || uuid();
  }

  return record;
}