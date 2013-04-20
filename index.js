
/**
 * Module dependencies.
 */

var adapter = require('tower-adapter')
  , topology = require('tower-topology')
  , Topology = topology('memory')
  , action = require('tower-stream')
  , filter = require('tower-filter')
  , noop = function(){};

/**
 * Expose `memory` adapter.
 */

exports = module.exports = adapter('memory');

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

action('memory.query')
  .on('exec', function(ctx, data, fn){
    var records = collection(ctx.collectionName)
      , constraints = ctx.constraints;

    if (constraints.length) {
      ctx.emit('data', filter(records, constraints));
    } else {
      // optimized case of no query params
      ctx.emit('data', records);
    }
    
    fn();
  });

/**
 * Create records.
 */

action('memory.create')
  .on('exec', function(ctx, data, fn){
    var records = collection(ctx.collectionName)
      , constraints = ctx.constraints;

    // XXX: generate uuid
    records.push.apply(records, ctx.data);
    ctx.emit('data', ctx.data);
    fn();
  });

/**
 * Update records.
 */

action('memory.update')
  .on('exec', function(context, data, next){
    var constraints = context.constraints;

    
  });

/**
 * Remove records.
 */

action('memory.remove')
  .on('exec', function(context, data, next){
    var constraints = context.constraints;

    
  });

/**
 * Execute a database query.
 */

exports.execute = function(constraints, fn){
  var topology = new Topology
    , name;

  var action = constraints[constraints.length - 1][1];

  // XXX: this function should just split the constraints by model/adapter.
  // then the adapter
  for (var i = 0, n = constraints.length; i < n; i++) {
    var constraint = constraints[i];
    switch (constraint[0]) {
      case 'select':
      case 'start':
        topology.stream(name = 'memory.' + action, { constraints: [], collectionName: constraint[1] });
        break;
      case 'constraint':
        // XXX: shouldn't have to create another array here, tmp for now.
        topology.streams[name].constraints.push([ constraint[2], constraint[1], constraint[3] ]);
        break;
      case 'action':
        topology.streams[name].data = constraint[2];
        break;
    }
  }

  // XXX: need to come up w/ API for adding events before it's executed.
  process.nextTick(function(){
    topology.exec();
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