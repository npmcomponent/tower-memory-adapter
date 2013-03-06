var MemoryAdapter = require('..')
  , adapter = require('tower-adapter')
  , container = require('tower-container')
  , model = require('tower-model')
  , assert = require('chai').assert;

var database = {
  posts: [
      { id: 1, title: 'post one' }
    , { id: 2, title: 'post two' }
    , { id: 3, title: 'post three' }
  ],

  comments: [
      { id: 10, message: 'comment one', userId: 100, embeddedIn: 'post' } // embedded
    , { id: 10, message: 'comment one', userId: 101, postId: 1 } // referenced
  ],

  users: [
      { id: 100, email: 'user100@email.com' }
    , { id: 101, email: 'user101@email.com' }
  ]
}

adapter('memory').prototype.recordsByType = database;

describe('memoryAdapter', function(){
  var Post = model('post')
    .attr('title', { type: 'string' });

  /*
  it('should execute criteria', function(done){
    var post = new Post({ title: 'foo' });

    var criteria = [
        ['start', 'posts']
      , ['action', 'insert', post]
    ];

    adapter('memory').execute(criteria, function(){
      done();
    });
  });
  */

  it('should query', function(done){
    var criteria = [
        ['start', 'posts']
      , ['condition', 'eq', 'title', 'post two']
      , ['action', 'query']
    ];

    adapter('memory').execute(criteria, function(err, records){
      assert.equal(1, records.length);
      assert.deepEqual({ id: 2, title: 'post two' }, records[0]);
      done();
    });
  })
});
