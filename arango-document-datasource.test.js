const { ArangoDocumentDataSource } = require('.');

describe('ArangDocumentDataSource', () => {
  test('it batches key loads', async () => {
    const results = [{ _id: '123' }, { _id: '456' }];
    const db = createDb(results);
    const datasource = new ArangoDocumentDataSource(db);
    datasource.initialize();

    const docs = await Promise.all([
      datasource.get('123'),
      datasource.get('456')
    ]);

    expect(docs).toEqual(results);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('it caches key loads', async () => {
    const results = [{ _id: '123' }];
    const db = createDb(results);
    const datasource = new ArangoDocumentDataSource(db);
    datasource.initialize();

    for (let i = 0; i < 3; i++) {
      const doc = await datasource.get('123');
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(doc).toEqual(results[0]);
    }
  });

  test('it returns docs for several keys', async () => {
    const results = [{ _id: '123' }, { _id: '456' }];
    const db = createDb(results);
    const datasource = new ArangoDocumentDataSource(db);
    datasource.initialize();

    const docs = await datasource.getMany(['456', '123']);

    expect(docs).toEqual(results.reverse());
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  describe(`exists`, () => {
    test(`it returns true if a document exists`, async () => {
      const results = ['123'];
      const db = createExistsDb(results);
      const datasource = new ArangoDocumentDataSource(db);
      datasource.initialize();

      const exists = await datasource.exists('123');

      expect(exists).toBe(true);
    });

    test(`it caches the results`, async () => {
      const results = ['123'];
      const db = createExistsDb(results);
      const datasource = new ArangoDocumentDataSource(db);
      datasource.initialize();

      await datasource.exists('123');
      await datasource.exists('123');

      expect(db.query).toHaveBeenCalledTimes(1);
    });

    test(`it batches the calls`, async () => {
      const results = ['123'];
      const db = createExistsDb(results);
      const datasource = new ArangoDocumentDataSource(db);
      datasource.initialize();

      await Promise.all([datasource.exists('123'), datasource.exists('123')]);

      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });

  describe(`manyExist`, () => {
    test(`it returns a list of document existence`, async () => {
      const results = ['123'];
      const db = createExistsDb(results);
      const datasource = new ArangoDocumentDataSource(db);
      datasource.initialize();

      const exists = await datasource.manyExist(['123', '456']);

      expect(exists[0]).toBe(true);
      expect(exists[1]).toBe(false);
    });

    test(`it caches the results`, async () => {
      const results = ['123'];
      const db = createExistsDb(results);
      const datasource = new ArangoDocumentDataSource(db);
      datasource.initialize();

      await datasource.manyExist(['123']);
      await datasource.manyExist(['123']);

      expect(db.query).toHaveBeenCalledTimes(1);
    });

    test(`it batches the calls`, async () => {
      const results = ['123'];
      const db = createExistsDb(results);
      const datasource = new ArangoDocumentDataSource(db);
      datasource.initialize();

      await Promise.all([
        datasource.manyExist(['123']),
        datasource.manyExist(['123'])
      ]);

      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });
});

function createDb(queryResults) {
  return {
    query: jest.fn().mockResolvedValue({
      all: () => [queryResults]
    })
  };
}

function createExistsDb(queryResults) {
  return {
    query: jest.fn().mockResolvedValue({
      all: () => queryResults
    })
  };
}
