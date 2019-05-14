const { DataSource } = require('apollo-datasource');
const DataLoader = require('dataloader');
const { aql } = require('arangojs');

/**
 * An ArangoDb implementation of the Apollo DataSource.
 *
 * This DataSource is solely for resolving Arando Documents by their Id.
 * Requests are batched and cached per request.
 *
 * @class ArangoDocumentDataSource
 * @extends {DataSource}
 */
class ArangoDocumentDataSource extends DataSource {
  /**
   * Creates an instance of ArangoDocumentDataSource.
   * @param {Database} db
   * @memberof ArangoDocumentDataSource
   */
  constructor(db) {
    super();
    this.db = db;
  }

  /**
   * Initializes the DataSource. Called at the beginning of each request.
   *
   * @memberof ArangoDocumentDataSource
   */
  initialize() {
    this.dataloader = new DataLoader(keys => this.loadKeys(keys));
  }

  /**
   * Gets a Document by its _id
   *
   * @param {string} id The _id to query for
   * @returns {any} The corresponding Document
   * @memberof ArangoDocumentDataSource
   */
  async get(id) {
    return this.dataloader.load(id);
  }

  /**
   * Gets several Documents at once by their _id
   *
   * @param {string[]} ids The _ids to query for
   * @returns {any[]} The corresponding Documents. In the order their Ids were specified in the ids array
   * @memberof ArangoDocumentDataSource
   */
  async getMany(ids) {
    return this.dataloader.loadMany(ids);
  }

  /**
   * Queries the database for the given keys.
   *
   * @param {string[]} keys The keys to qeury for
   * @private
   * @returns {*[]} The corresponding Documents. In the order their Ids were specified in the ids array
   * @memberof ArangoDocumentDataSource
   */
  async loadKeys(keys) {
    const cursor = await this.db.query(aql`RETURN DOCUMENT(${keys})`);
    const nodes = await cursor.all();

    return keys.map(key => {
      const node = nodes.find(node => node._id === key);

      if (node) {
        node.id = node._id;
      }

      return node;
    });
  }
}

module.exports = {
  ArangoDocumentDataSource: ArangoDocumentDataSource
};
