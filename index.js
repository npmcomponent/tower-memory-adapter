
/**
 * Module dependencies.
 */

var adapter = require('tower-adapter')
  , topology = require('tower-topology')
  , Topology = topology('memory')
  , action = require('tower-stream')
  , filter = require('tower-filter')
  , validate = require('tower-validate')
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
    var records = collection(context.collectionName)
      , data = context.data;

    // XXX: or `isBlank`
    // if (!data)

    if (context.constraints)
      records = filter(records, context.constraints);

    // XXX: this could be optimized to just iterate once
    //      by reimpl part of `filter` here.
    // XXX: or maybe there is a `each-array-and-remove` that
    // is a slightly different iteration pattern so you can
    // remove/modify items while iterating.
    for (var i = 0, n = records.length; i < n; i++) {
      // XXX: `merge` part?
      for (var key in data) records[i][key] = data[key];
    }

    context.emit('data', records);
  });

/**
 * Remove records.
 */

action('memory.remove')
  .on('exec', function(context, data, fn){
    var records = collection(context.collectionName)
      , constraints = context.constraints;

    var result = [];

    if (constraints) {
      // XXX: or `filter(r, c, true)` where `true` says remove from array
      // or maybe there is a `filter.compile` function, that
      // creates an optimized filter given parameters.
      // records = filter(records, context.constraints, function(record, i, array){
      //   array.splice(i, 1);
      // });
      var i = records.length;

      // XXX: is there a more optimal algorithm?
      while (--i) {
        if (validate(records[i], constraints)) {
          result.unshift(records.splice(i, 1)[0]);
        }
      }
    }

    context.emit('data', result);
    fn();
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