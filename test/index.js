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

adapter('memory').prototype.recordsByType = database;

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

  it('should query', function(done){
    var criteria = [
        ['start', 'posts']
      , ['condition', 'eq', 'title', 'post two']
      , ['condition', 'gte', 'likeCount', 5]
      , ['action', 'query']
    ];

    adapter('memory').execute(criteria, function(err, records){
      assert.equal(2, records.length);
      assert.equal('post two', records[0].title);
      assert.equal('post two', records[1].title);
      done();
    });
  });

  it('should query multiple collections', function(done){
    // something along these lines, still thinking..
    var criteria = [
        ['start', 'comments']
      , ['relation', 'outgoing', 'post']
      // or, if length == 6 then collection.property
      , ['condition', 'eq', 'post.title', 'post two']
      , ['return', 'comments']
      , ['action', 'query']
    ];

    adapter('memory').execute(criteria, function(err, records){
      assert.equal(1, records.length);
      assert.equal('post two', records[0].title);
      done();
    });
  })
});