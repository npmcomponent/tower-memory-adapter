# Tower Memory Adapter

Nothing yet.

Not sure if this should be called a "store" instead of an adapter. Going with this for now.

## Installation

```
npm install tower-memory-adapter
```

## API

``` javascript
var MemoryAdapter = require('tower-memory-adapter');
```

There may be a standard way to traverse a `criteria` array for different types of operations:

- every modification opertation (insert, update, remove) takes criteria compiled into a hash of attributes (default attributes are the criteria, merged with each inserted record).
- the controller splits the criteria into new sets of criteria based on adapter.
- the controller then passes each of these criteria to it's matching adapter's `execute` method.
- the adapter's `execute` method then scans for "stop" points, or "action" criterion.
- each "action" array takes a custom set of criteria that is built from everything previous to it.
  - this is adapter specific.
  - each set of criterion can include the result from the previous action (such as ids from matching records).
  - so, each action returns with a specific "returns" set of operations. these then get added to the next subset of criteria. ideally (later) you can paginate through like this, which would really allow complex joins. so you do this whole process a thousand time, 20 records at a time type thing.
- you find the table to query/modify for each action based on the last `relation` or `start` specified in the criteria.

## Running Tests

```
git clone git://github.com/tower/memory-adapter.git tower-memory-adapter
cd tower-memory-adapter
npm install
```

then run the tests:

```
npm test
```

## License

MIT