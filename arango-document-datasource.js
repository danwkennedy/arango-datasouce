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
    this.dataloader = new DataLoader((keys) => this.loadKeys(keys));
    this.existsDataloader = new DataLoader((keys) =>
      this.checkForExistence(keys)
    );
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
   * Note: if a key does not exist, null will be returned
   *
   * @param {string[]} ids The _ids to query for
   * @returns {object|Error[]} The corresponding Documents. In the order their Ids were specified in the ids array.
   * @memberof ArangoDocumentDataSource
   */
  async getMany(ids) {
    return this.dataloader.loadMany(ids);
  }

  /**
   * Returns whether a given document exists
   *
   * @param {String} id The id of the document
   * @returns {Boolean} Whether or not the document exists
   * @memberof ArangoDocumentDataSource
   */
  async exists(id) {
    return this.existsDataloader.load(id);
  }

  /**
   * Returns whether a given list of documents exist
   *
   * @param {String[]} ids A list of document ids to check
   * @returns {Boolean[]} A corresponding list of booleans. The order matches the ids list.
   * @memberof ArangoDocumentDataSource
   */
  async manyExist(ids) {
    return this.existsDataloader.loadMany(ids);
  }

  /**
   * Queries the database for the given keys.
   *
   * @param {string[]} keys The keys to query for
   * @private
   * @returns {*[]} The corresponding Documents. In the order their Ids were specified in the ids array
   * @memberof ArangoDocumentDataSource
   */
  async loadKeys(keys) {
    const cursor = await this.db.query(aql`RETURN DOCUMENT(${keys})`);
    const [nodes] = await cursor.all();

    return keys.map((key) => {
      const node = nodes.find((node) => node._id === key);

      if (node) {
        node.id = node._id;
      }

      return node;
    });
  }

  /**
   * Checks whether the given keys exist
   *
   * @param {String[]} keys A list of keys to check for
   * @returns {Boolean[]} The corresponding list of booleans. The order matches the keys list.
   * @memberof ArangoDocumentDataSource
   */
  async checkForExistence(keys) {
    const cursor = await this.db.query(aql`
      FOR key in ${keys}
        RETURN (DOCUMENT(key))._id
    `);
    const nodes = await cursor.all();

    const output = [];
    for (const [index, id] of keys.entries()) {
      output[index] = nodes[index] === id;
    }

    return output;
  }
}

module.exports = {
  ArangoDocumentDataSource: ArangoDocumentDataSource,
};
