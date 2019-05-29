const { EdgeManager } = require(`.`);

class EdgeCollectionMock {
  constructor() {
    this.save = jest.fn();
  }

  reset() {
    this.save.mockReset();
  }
}

class DbMock {
  constructor() {
    this.query = jest.fn();
  }

  reset() {
    this.query.mockReset();
  }
}

describe(`EdgeManager`, () => {
  const collectionMock = new EdgeCollectionMock();
  const dbMock = new DbMock();
  const manager = new EdgeManager(dbMock, collectionMock);

  afterEach(() => {
    collectionMock.reset();
    dbMock.reset();
  });

  test(`it calls collection.save()`, async () => {
    const doc = { name: 'abc' };
    const from = 'abc';
    const to = 'xyz';
    const properties = { test: true };
    collectionMock.save.mockResolvedValue({ new: doc });

    const output = await manager.create(from, to, properties);
    expect(output).toEqual({ new: doc });
    expect(collectionMock.save).toHaveBeenCalledTimes(1);
    expect(collectionMock.save).toHaveBeenCalledWith(properties, from, to, {
      returnNew: true
    });
  });

  test(`it calls collection.remove()`, async () => {
    const edge = { name: 'abc' };
    dbMock.query.mockResolvedValue(edge);

    const output = await manager.remove('123');
    expect(output).toEqual({ old: edge });
    expect(dbMock.query).toHaveBeenCalledTimes(1);
  });
});
