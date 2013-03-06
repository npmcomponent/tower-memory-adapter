
/**
 * Module dependencies.
 */

var adapter = require('tower-adapter')
  , container = require('tower-container')
  , MemoryAdapter = adapter('memory');

/**
 * Expose `MemoryAdapter`.
 */

module.exports = MemoryAdapter;

MemoryAdapter
  .type('string');
