const { DocumentManager } = require(`.`);

class CollectionMock {
  constructor() {
    this.save = jest.fn();
    this.replace = jest.fn();
    this.update = jest.fn();
    this.remove = jest.fn();
  }

  reset() {
    this.save.mockReset();
    this.replace.mockReset();
    this.update.mockReset();
    this.remove.mockReset();
  }
}

describe(`DocumentManager`, () => {
  const collectionMock = new CollectionMock();
  const manager = new DocumentManager(collectionMock);

  afterEach(() => {
    collectionMock.reset();
  });

  test(`it calls collection.save()`, async () => {
    const doc = { name: 'abc' };
    collectionMock.save.mockResolvedValue({ new: doc });

    const output = await manager.create(doc);
    expect(output).toEqual({ new: doc });
    expect(collectionMock.save).toHaveBeenCalledTimes(1);
    expect(collectionMock.save).toHaveBeenCalledWith(doc, {
      returnNew: true,
    });
  });

  test(`it calls collection.replace()`, async () => {
    const oldDoc = { name: 'abc' };
    const newDoc = { name: 'xyz' };
    collectionMock.replace.mockResolvedValue({ new: newDoc, old: oldDoc });

    const output = await manager.replace('123', newDoc);
    expect(output).toEqual({ new: newDoc, old: oldDoc });
    expect(collectionMock.replace).toHaveBeenCalledTimes(1);
    expect(collectionMock.replace).toHaveBeenCalledWith('123', newDoc, {
      returnNew: true,
      returnOld: true,
    });
  });

  test(`it calls collection.update()`, async () => {
    const oldDoc = { name: 'abc' };
    const newDoc = { name: 'xyz' };
    collectionMock.update.mockResolvedValue({ new: newDoc, old: oldDoc });

    const output = await manager.update('123', newDoc);
    expect(output).toEqual({ new: newDoc, old: oldDoc });
    expect(collectionMock.update).toHaveBeenCalledTimes(1);
    expect(collectionMock.update).toHaveBeenCalledWith('123', newDoc, {
      returnNew: true,
      returnOld: true,
      mergeObjects: false,
      keepNull: false,
    });
  });

  test(`it calls collection.remove()`, async () => {
    const doc = { name: 'abc' };
    collectionMock.remove.mockResolvedValue({ old: doc });

    const output = await manager.remove('123');
    expect(output).toEqual({ old: doc });
    expect(collectionMock.remove).toHaveBeenCalledTimes(1);
    expect(collectionMock.remove).toHaveBeenCalledWith('123', {
      returnOld: true,
    });
  });
});
