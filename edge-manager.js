const { DataSource } = require('apollo-datasource');
const { aql } = require('arangojs');

/**
 * Manages ArangoDb edges
 *
 * @class EdgeManager
 * @extends {DataSource}
 */
class EdgeManager extends DataSource {
  /**
   * Creates an instance of EdgeManager.
   * @param {Database} db An instance of an ArangoDb Database
   * @param {EdgeCollection} collection An instance of an ArangoDb EdgeCollection
   * @memberof EdgeManager
   */
  constructor(db, collection) {
    super();
    this.db = db;
    this.collection = collection;
  }

  /**
   * Creates a new edge between two documents
   *
   * @param {String} from The id of the origin document
   * @param {String} to The id of the destination document
   * @param {*} [properties={}] An object with key values describing the relationship
   * @returns An object with the new version of the edge
   * @memberof EdgeManager
   */
  async create(from, to, properties = {}) {
    const { new: edge } = await this.collection.save(properties, from, to, {
      returnNew: true
    });
    return { new: edge };
  }

  /**
   * Removes an edge from between two documents
   *
   * @param {String} from The id of the origin document
   * @param {String} to The id of the destination document
   * @returns An object with the old version of the edge
   * @memberof EdgeManager
   */
  async remove(from, to) {
    const edge = await this.db.query(aql`
      FOR edge in ${this.collection}
        FILTER edge._from == ${from}
        FILTER edge._to == ${to}
        REMOVE edge._key IN ${this.collection}
        RETURN OLD
    `);

    if (edge === null) {
      throw new Error(`Couldn't find edge`);
    }

    return { old: edge };
  }
}

module.exports = {
  EdgeManager: EdgeManager
};
