var query = require('tower-query')
  , model = require('tower-model')
  , memory = require('..')
  , adapter = require('tower-adapter')
  , assert = require('assert');

var database = {
  post: [
      { id: 1, title: 'post one', likeCount: 20 }
    , { id: 2, title: 'post two', likeCount: 15 }
    , { id: 3, title: 'post three', likeCount: 3 }
    , { id: 4, title: 'post two', likeCount: 5 }
  ],

  comment: [
      { id: 10, message: 'comment one', userId: 100, embeddedIn: 'post' } // embedded
    , { id: 10, message: 'comment one', userId: 101, postId: 2 } // referenced
  ],

  user: [
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
        ['select', 'posts']
      , ['action', 'insert', post]
    ];

    adapter('memory').execute(criteria, function(){
      done();
    });
  });
  */

  it('should find', function(done){
    query()
      .use('memory')
      .select('post')
      .where('title').eq('post two')
      .where('likeCount').gte(5)
      .find(function(err, records){
        assert.equal(2, records.length);
        assert.equal('post two', records[0].title);
        assert.equal('post two', records[1].title);
        done();
      });
  });

  it('should create', function(done){
    query()
      .use('memory')
      .select('post')
      .create({ id: 5, title: 'foo' }, function(err, records){
        assert(1 === records.length);
        assert('foo' === records[0].title);
        assert(5 === records[0].__id__);

        query()
          .use('memory')
          .select('post')
          .find(function(err, records){
            assert(5 === records.length);
            database.post.pop();
            done();
          });
      });
  });

  it('should update', function(done){
    query()
      .use('memory')
      .select('post')
      .where('title').eq('post three')
      .update({ title: 'post three!!!' }, function(err, records){
        assert(1 === records.length);
        assert('post three!!!' === records[0].title);

        query()
          .use('memory')
          .select('post')
          .find(function(err, records){
            assert(4 === records.length);
            records[2].title = 'post three';
            done();
          });
      });
  });

  it('should remove', function(done){
    query()
      .use('memory')
      .select('post')
      .where('title').eq('post three')
      .remove(function(err, records){
        assert(1 === records.length);
        assert('post three' === records[0].title);

        query()
          .use('memory')
          .select('post')
          .find(function(err, currentRecords){
            assert(3 === currentRecords.length);
            done();
          });
      });
  });

  it('should generate an `__id__` for a record if no `id`', function(done){
    query()
      .use('memory')
      .select('post')
      .create({ title: 'foo' }, function(err, records){
        var created = records[0];
        assert(36 === created.__id__.length);

        query()
          .use('memory')
          .select('post')
          //.where('id').eq(created.__id__)
          .find(function(err, records){
            var found = records.pop();
            console.log(found)
            //assert(5 === records.length);
            database.post.pop();
            done();
          });
      });
  });

  /*it('should query multiple collections', function(done){
    // something along these lines, still thinking..
    var criteria = [
        ['select', 'comments']
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