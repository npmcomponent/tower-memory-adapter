var memory = require('..')
  , adapter = require('tower-adapter')
  , model = require('tower-model')
  , assert = require('assert');

var database = {
  posts: [
      { id: 1, title: 'post one', likeCount: 20 }
    , { id: 2, title: 'post two', likeCount: 15 }
    , { id: 3, title: 'post three', likeCount: 3 }
    , { id: 4, title: 'post two', likeCount: 5 }
  ],

  comments: [
      { id: 10, message: 'comment one', userId: 100, embeddedIn: 'post' } // embedded
    , { id: 10, message: 'comment one', userId: 101, postId: 2 } // referenced
  ],

  users: [
      { id: 100, email: 'user100@email.com' }
    , { id: 101, email: 'user101@email.com' }
  ]
}

adapter('memory').collections = database;

describe('memoryAdapter', function(){
  var Post = model('post')
    .attr('title', { type: 'string' })
    .attr('likeCount', { type: 'number' });

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

  it('should find', function(done){
    var criteria = [
        ['start', 'posts']
      , ['constraint', 'eq', 'title', 'post two']
      , ['constraint', 'gte', 'likeCount', 5]
      , ['action', 'query']
    ];

    // adapter('memory').execute(criteria, function(err, records){
    adapter('memory').execute(criteria).on('data', function(records){
      assert.equal(2, records.length);
      assert.equal('post two', records[0].title);
      assert.equal('post two', records[1].title);
      done();
    });
  });

  it('should create', function(done){
    var criteria = [
        ['start', 'posts']
      , ['action', 'create', [ { id: 5, title: 'foo' } ]]
    ];

    adapter('memory').execute(criteria).on('data', function(records){
      assert(1 === records.length);
      assert('foo' === records[0].title);

      var criteria = [
          ['start', 'posts']
        , ['action', 'query']
      ];

      adapter('memory').execute(criteria).on('data', function(records){
        assert(5 === records.length);
        database.posts.pop();
        done();
      });
    });
  });

  it('should update', function(done){
    var criteria = [
        ['start', 'posts']
        // XXX: update records manually
        //, ['action', 'update', [ { id: 3, title: 'post three!!!' } ]]
        // update records matching pattern
      , ['constraint', 'eq', 'title', 'post three']
      , ['action', 'update', { title: 'post three!!!' } ]
    ];

    adapter('memory').execute(criteria).on('data', function(records){
      assert(1 === records.length);
      assert('post three!!!' === records[0].title);

      var criteria = [
          ['start', 'posts']
        , ['action', 'query']
      ];

      adapter('memory').execute(criteria).on('data', function(records){
        assert(4 === records.length);
        records[2].title = 'post three';
        done();
      });
    });
  });

  it('should remove', function(done){
    var criteria = [
        ['start', 'posts']
      , ['constraint', 'eq', 'title', 'post three']
      , ['action', 'remove' ]
    ];

    adapter('memory').execute(criteria).on('data', function(records){
      assert(1 === records.length);
      assert('post three' === records[0].title);

      var criteria = [
          ['start', 'posts']
        , ['action', 'query']
      ];

      adapter('memory').execute(criteria).on('data', function(currentRecords){
        assert(3 === currentRecords.length);
        done();
      });
    });
  });

  /*it('should query multiple collections', function(done){
    // something along these lines, still thinking..
    var criteria = [
        ['start', 'comments']
      , ['relation', 'outgoing', 'post']
      // or, if length == 6 then collection.property
      , ['constraint', 'eq', 'post.title', 'post two']
      , ['return', 'comments']
      , ['action', 'query']
    ];

    adapter('memory').execute(criteria).on('data', function(records){
      assert.equal(1, records.length);
      assert.equal('post two', records[0].title);
      done();
    });
  });*/
});