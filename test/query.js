var memory = require('..')
  , model = require('tower-model')
  , assert = require('assert');

describe('memory-adapter query', function(){
  before(function(){
    memory.clear();
    memory.load({
      post: [
          { id: 1, title: 'post one', likeCount: 20 }
        , { id: 2, title: 'post two', likeCount: 15 }
        , { id: 3, title: 'post three', likeCount: 3 }
        , { id: 4, title: 'post two', likeCount: 5 }
      ]
    });
  });

  describe('select', function(){
    it('should select `all`', function(done){
      memory.query()
        .select('post')
        .all(function(err, records){
          assert(4 === records.length);
          done();
        });
    });
  });

  describe('limit', function(){
    it('should limit', function(done){
      memory.query()
        .select('post')
        .limit(2)
        .all(function(err, records){
          assert(2 === records.length);
          assert(1 === records[0].id)
          done();
        });
    });
  });

  describe('sort', function(){
    it('should `sort`', function(done){
      memory.query()
        .select('post')
        .sort('id', -1)
        .all(function(err, records){
          console.log(records[0].id);
          done();
        });
    });
  });
});