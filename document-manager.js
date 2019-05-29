const { DataSource } = require('apollo-datasource');

/**
 * Manages ArangoDb documents
 *
 * @class DocumentManager
 * @extends {DataSource}
 */
class DocumentManager extends DataSource {
  /**
   * Creates an instance of DocumentManager.
   * @param {Collection} collection The ArangoDb document collection to manage
   * @memberof DocumentManager
   */
  constructor(collection) {
    super();
    this.collection = collection;
  }

  /**
   * Create a new document and add it to the collection
   *
   * @param {*} input
   * @returns {*} An object with the created document as the new field
   * @memberof DocumentManager
   */
  async create(input) {
    const { new: document } = await this.collection.save(input, {
      returnNew: true
    });

    return { new: document };
  }

  /**
   * Replace all of a document's values
   *
   * @param {String} id The id of the document to update
   * @param {*} input An object with the values to replace
   * @returns {*} An object with the old and new versions of the document
   * @memberof DocumentManager
   */
  async replace(id, input) {
    const results = await this.collection.replace(id, input, {
      returnNew: true,
      returnOld: true
    });

    return {
      new: results.new,
      old: results.old
    };
  }

  /**
   * Updates a subset of a document's values. Values not passed as input are left unchanged.
   *
   * @param {String} id The id of the document to update
   * @param {*} input An object with the values to update
   * @param {*} [{ keepNull = false, mergeObjects = false }={}] A set of options:
   *  keepNull: if true null values are left as null. If false, the field is removed.
   * @returns An object with the old and new versions of the document
   * @memberof DocumentManager
   */
  async update(id, input, { keepNull = false, mergeObjects = false } = {}) {
    const results = await this.collection.update(id, input, {
      keepNull,
      mergeObjects,
      returnNew: true,
      returnOld: true
    });

    return {
      new: results.new,
      old: results.old
    };
  }

  /**
   * Removes a document from the collection.
   *
   * @param {String} id The id of the document to remove
   * @returns An object with the old version of the document
   * @memberof DocumentManager
   */
  async remove(id) {
    const { old: document } = await this.collection.remove(id, {
      returnOld: true
    });
    return { old: document };
  }
}

module.exports = {
  DocumentManager: DocumentManager
};
