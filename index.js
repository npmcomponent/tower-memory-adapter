
/**
 * Module dependencies.
 */

var adapter = require('tower-adapter')
  , topology = require('tower-topology')
  , Topology = topology('memory')
  , stream = require('tower-stream')
  , noop = function(){};

/**
 * Expose `memory` adapter.
 */

var exports = module.exports = adapter('memory');

/**
 * Collections by name.
 */

exports.collections = {};

/**
 * Define MongoDB adapter.
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

stream('memory.find')
  .on('execute', function(context, data, next){
    var records = collection(context.collectionName)
      , criteria = context.criteria;

    // iterate
  });

/**
 * Create records.
 */

stream('memory.create')
  .on('execute', function(ctx, data, fn){
    var records = collection(context.collectionName)
      , criteria = ctx.criteria;

    //create(data.records, fn);
  });

/**
 * Update records.
 */

stream('memory.update')
  .on('execute', function(context, data, next){
    var criteria = context.criteria;

    
  });

/**
 * Remove records.
 */

stream('memory.remove')
  .on('execute', function(context, data, next){
    var criteria = context.criteria;

    
  });

/**
 * Execute a database query.
 */

exports.execute = function(criteria, fn){
  var topology = new Topology
    , name;

  // XXX: this function should just split the criteria by model/adapter.
  // then the adapter
  for (var i = 0, n = criteria.length; i < n; i++) {
    var criterion = criteria[i];
    switch (criterion[0]) {
      case 'select':
      case 'start':
        topology.stream(name = 'memory.find', { constraints: [] });
        break;
      case 'constraint':
        topology.streams[name].constraints.push(criterion);
        break;
    }
  }

  // XXX: need to come up w/ API for adding events before it's executed.
  process.nextTick(function(){
    topology.execute();
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