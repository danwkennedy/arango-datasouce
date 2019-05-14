const { ArangoDataSource } = require('.');
const { aql } = require('arangojs');
const hash = require('object-hash');

describe('ArangDataSource', () => {
  test('it queries the db (cache miss)', async () => {
    const result = { results: 'output' };
    const db = createDb(result);
    const config = createConfig();
    const query = aql`DOCUMENT()`;

    const datasource = new ArangoDataSource(db);

    datasource.initialize(config);

    const output = await datasource.query(query);
    expect(output).toEqual(result);
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(config.cache.set).toHaveBeenCalledTimes(1);
    expect(config.cache.set).toHaveBeenCalledWith(hash(query), result);
  });

  test('it queries the db (cache hit)', async () => {
    const result = { results: 'output' };
    const query = aql`DOCUMENT()`;
    const key = hash(query);
    const db = createDb(result);
    const config = createConfig({
      [key]: result
    });

    const datasource = new ArangoDataSource(db);

    datasource.initialize(config);

    const output = await datasource.query(query);
    expect(output).toEqual(result);
    expect(db.query).toHaveBeenCalledTimes(0);
    expect(config.cache.set).toHaveBeenCalledTimes(0);
    expect(config.cache.get).toHaveBeenCalledTimes(1);
    expect(config.cache.get).toHaveReturnedWith(Promise.resolve(result));
  });

  test('it caches a successful query', async () => {
    const result = { results: 'output' };
    const db = createDb(result);
    const config = createConfig();
    const query = aql`DOCUMENT()`;

    const datasource = new ArangoDataSource(db);

    datasource.initialize(config);

    for (let i = 1; i <= 3; i++) {
      const output = await datasource.query(query);
      expect(output).toEqual(result);
      expect(db.query).toHaveBeenCalledTimes(1);

      expect(config.cache.get).toHaveBeenCalledTimes(i);
      expect(config.cache.get).toHaveReturnedWith(Promise.resolve(result));

      expect(config.cache.set).toHaveBeenCalledTimes(1);
      expect(config.cache.set).toHaveBeenCalledWith(hash(query), result);
    }
  });

  test('it ignores the cache', async () => {
    const result = { results: 'output' };
    const db = createDb(result);
    const config = createConfig();
    const query = aql`DOCUMENT()`;

    const datasource = new ArangoDataSource(db);

    datasource.initialize(config);

    const output = await datasource.query(query, { useCache: false });
    expect(output).toEqual(result);
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(config.cache.set).toHaveBeenCalledTimes(0);
    expect(config.cache.get).toHaveBeenCalledTimes(0);
  });
});

function createDb(queryResults) {
  return {
    query: jest.fn().mockResolvedValue({
      all: () => queryResults
    })
  };
}

function createConfig(cache = {}) {
  return {
    cache: {
      get: jest.fn().mockImplementation(async key => cache[key]),
      set: jest
        .fn()
        .mockImplementation(async (key, result) => (cache[key] = result))
    }
  };
}
