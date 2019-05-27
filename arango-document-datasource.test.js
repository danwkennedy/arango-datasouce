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
});

function createDb(queryResults) {
  return {
    query: jest.fn().mockResolvedValue({
      all: () => [queryResults]
    })
  };
}
