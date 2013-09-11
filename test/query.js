var memory = require('..')
var resource = require('tower-resource')
var assert = require('assert');

describe('memory-adapter query', function(){
  beforeEach(function(){
    memory.clear();
    memory.load('post', [
      { id: 1, title: 'post one', likeCount: 20 },
      { id: 2, title: 'post two', likeCount: 15 },
      { id: 3, title: 'post three', likeCount: 3 },
      { id: 4, title: 'post two', likeCount: 5 }
    ]);
  });

  describe('select', function(){
    it('should select `all`', function(done){
      memory.query()
        .resource('post')
        .select(function(err, records){
          assert(4 === records.length);
          done();
        });
    });
  });

  describe('limit', function(){
    it('should limit', function(done){
      memory.query()
        .resource('post')
        .limit(2)
        .select(function(err, records){
          assert(2 === records.length);
          assert(1 === records[0].__id__);
          done();
        });
    });
  });

  describe('sort', function(){
    it('should `sort`', function(done){
      memory.query()
        .resource('post')
        .sort('id', -1)
        .select(function(err, records){
          done();
        });
    });
  });

  it('should remove by `id`', function(){
    memory.query().resource('post').select(function(err, records){
      assert(4 === records.length);

      var second = records[1];
      memory.query().resource('post').remove(second, function(){
        memory.query().resource('post').select(function(err, records){
          assert(3 === records.length);
        });
      });
    });
  });
});