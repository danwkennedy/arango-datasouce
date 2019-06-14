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

  describe(`EdgeManager.create`, () => {
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
  });

  describe(`EdgeManager.remove`, () => {
    test(`it calls db.query()`, async () => {
      const edge = { name: 'abc' };
      dbMock.query.mockResolvedValue(edge);

      const output = await manager.remove('123');
      expect(output).toEqual({ old: edge });
      expect(dbMock.query).toHaveBeenCalledTimes(1);
    });

    test(`it throws when the edge doesn't exist`, async () => {
      dbMock.query.mockResolvedValue(null);
      await expect(manager.remove('123')).rejects.toThrow();
    });
  });

  describe(`EdgeManager.createMany`, () => {
    test(`it calls db.query`, async () => {
      await manager.createMany([{ _from: '123', _to: '123', test: true }]);
      expect(dbMock.query).toHaveBeenCalledTimes(1);
    });
  });

  describe(`EdgeManager.createOneToMany`, () => {
    test(`it calls getProperties() for every edge`, async () => {
      const getProperties = jest.fn();
      await manager.createOneToMany('123', ['456', '789'], getProperties);

      expect(getProperties).toHaveBeenCalledTimes(2);
      expect(getProperties).toHaveBeenNthCalledWith(1, '123', '456');
      expect(getProperties).toHaveBeenNthCalledWith(2, '123', '789');
    });

    test(`it calls db.query`, async () => {
      await manager.createOneToMany('123', ['456', '789']);
      expect(dbMock.query).toHaveBeenCalledTimes(1);
    });
  });

  describe(`EdgeManager.createManyToOne`, () => {
    test(`it calls getProperties() for every edge`, async () => {
      const getProperties = jest.fn();
      await manager.createManyToOne(['456', '789'], '123', getProperties);

      expect(getProperties).toHaveBeenCalledTimes(2);
      expect(getProperties).toHaveBeenNthCalledWith(1, '456', '123');
      expect(getProperties).toHaveBeenNthCalledWith(2, '789', '123');
    });

    test(`it calls db.query`, async () => {
      await manager.createManyToOne(['456', '789'], '123');
      expect(dbMock.query).toHaveBeenCalledTimes(1);
    });
  });

  describe(`EdgeManager.removeMany`, () => {
    test(`it calls db.query`, async () => {
      await manager.removeMany([{ _from: '123', _to: '123', test: true }]);
      expect(dbMock.query).toHaveBeenCalledTimes(1);
    });
  });
});
