var MemoryAdapter = require('..')
  , adapter = require('tower-adapter')
  , container = require('tower-container')
  , model = require('tower-model')
  , assert = require('chai').assert;

describe('memoryAdapter', function() {
  var Post = model('post')
    .attr('title', 'string');

  it('should execute criteria', function(done) {
    var post = new Post({ title: 'foo' });

    var criteria = [
        ['start', 'posts']
      , ['action', 'insert', post]
    ];

    adapter('memory').execute(criteria, function(){
      console.log(arguments);
      done();
    });
  });
});
