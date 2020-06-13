# arango-datasouce
An implementation of Apollo's datasource for ArangoDb

## Installation

```
$ npm install arango-datasource
```

## DataSources

### ArangoDataSource

A "general purpose" datasource that's mainly suitable for querying the database using AQL.

Requires passing the target database instance from `arango-js`

```js
// index.js

const { ArangoDataSource } = require('@danwkennedy/arango-datasource');
const { Database } = require('arango-js');

// initialize the db
const database = new Database('http://my.database.url');

// initialize the server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache,
  context,
  dataSources: () => ({
    arangoDataSource: new ArangoDataSource(database)
  })
});
```

Extend this class to create more targetted DataSources according to your needs:

```js
// UserDataSource.js

const { ArangoDataSource } = require('@danwkennedy/arango-datasource');

module.exports = class UserDataSource extends ArangoDataSource {

  // Pass the user collection to the DataSource
  constructor(db, collection) {
    super(db);
    this.collection = collection;
  }

  // Build the query and call super.query
  async getUsers() {
    const query = aql`
      FOR user in ${this.collection}
      return user
    `;

    return await this.query(query);
  }
}
```

Basic query caching is available. Cache keys for queries are simply the query object's hash value using `object-hash`. This type of caching is mainly useful when using a persisted cache across machines (i.e. Redis instead of the default in memory cache) and works best for fetching common data that doesn't change very often.

### ArangoDocumentDataSource

Uses the [DataLoader]() class to add batching and caching to fetching Arango Documents by their Id. This is especially useful as a `NodeDataSource`  as ArangoDb's default Id structure prepends the collection name to the `_key` making it so you don't need to pass the target collection the document datasource.

```js
// index.js

const { ArangoDocumentDataSource } = require('@danwkennedy/arango-datasource');
const { Database } = require('arango-js');

// initialize the db
const database = new Database('http://my.database.url');

// initialize the server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache,
  context,
  dataSources: () => ({
    NodeDataSource: new ArangoDocumentDataSource(database)
  })
});

// node/resolver.js

module.exports = {
  Query: {
    node: async (_, { id }, { dataSources }) => {
      return dataSources.NodeDataSource.load(id);
    },
  },
}

```

## Managers

DataSources fetch records from the database. Managers create/update/delete records from the database.

### DocumentManager

Manages the lifecylc of documents in a document collection.

```js
// index.js

const { DocumentManager } = require('@danwkennedy/arango-datasource');
const { Database } = require('arango-js');

// initialize the db
const database = new Database('http://my.database.url');
const userCollection = database.collection('users');

// initialize the server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache,
  context,
  dataSources: () => ({
    userDocumentManager: new DocumentManager(userCollection)
  })
});
```

### EdgeManager

Manages the lifecycle of edges in a graph.

```js
// index.js

const { EdgeManager } = require('@danwkennedy/arango-datasource');
const { Database } = require('arango-js');

// initialize the db
const database = new Database('http://my.database.url');
const userFavoriteFoodCollection = database.edgeCollection('user_favorite_food');

// initialize the server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache,
  context,
  dataSources: () => ({
    userDocumentManager: new EdgeManager(userFavoriteFoodCollection)
  })
});
```

The main difference between the `EdgeManager` and the `DocumentManager` is the `EdgeManager` requires the `_to` and `_from` ids be passed. It also smooths over some difficulties with removing edges where we might not know the edge's id. In that case, we can pass the `_from` and `_to` ids and the manager will do the query to find the correct edge.
