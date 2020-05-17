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
   * @param {Object} [properties={}] An object with key values describing the relationship
   * @returns An object with the new version of the edge
   * @memberof EdgeManager
   */
  async create(from, to, properties = {}) {
    const { new: edge } = await this.collection.save(properties, from, to, {
      returnNew: true,
    });
    return { new: edge };
  }

  /**
   * Create a one to many to one relationship. This is useful when bulk operations are possible.
   *
   * @param {String} fromId The id of the single document
   * @param {String[]} toIds An array of ids to the many documents
   * @param {Function} [getProperties=() => ({})] A function that resolves the extra properties of each edge
   * @param {Object} [opts={}] Options to pass to the create call
   * @returns {Object[]} An array of the created edges
   * @memberof EdgeManager
   */
  async createOneToMany(fromId, toIds, getProperties = () => ({}), opts = {}) {
    const edges = toIds.map((toId) => ({
      _from: fromId,
      _to: toId,
      ...getProperties(fromId, toId),
    }));

    return this.createMany(edges, opts);
  }

  /**
   * Create a many to one relationship. This is useful when bulk operations are possible.
   *
   * @param {String[]} fromIds The ids of the many documents
   * @param {String} toId The id of the single document
   * @param {Function} [getProperties=() => ({})] A function that resolves the extra properties of each edge
   * @param {Object} [opts={}] Options to pass to the create call
   * @returns {Object[]} An array of the created edges
   * @memberof EdgeManager
   */
  async createManyToOne(fromIds, toId, getProperties = () => ({}), opts = {}) {
    const edges = fromIds.map((fromId) => ({
      _from: fromId,
      _to: toId,
      ...getProperties(fromId, toId),
    }));
    return this.createMany(edges, opts);
  }

  /**
   * Create many edges in a single database call. This is useful when bulk operations are possible.
   *
   * @param {Object[]} edges The edges to create
   * @returns {Object[]} The created edges
   * @memberof EdgeManager
   */
  async createMany(edges) {
    const query = aql`
        FOR edge in ${edges}
            UPSERT { _from: edge._from, _to: edge._to }
                INSERT edge
                UPDATE {}
            IN ${aql.literal(this.collection.name)}
            RETURN NEW
    `;

    return this.db.query(query);
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

  /**
   * Removes multiple edges by filtering on their _from and _to handles. This is useful when bulk operations are possible.
   *
   * @param {*} edges
   * @returns
   * @memberof EdgeManager
   */
  async removeMany(edges) {
    const query = aql`
        FOR edge IN ${edges}
            FOR collectionEdge IN ${this.collection}
                FILTER collectionEdge._from == edge._from
                FILTER collectionEdge._to == edge._to
                REMOVE collectionEdge IN ${aql.literal(this.collection.name)}
            RETURN OLD
      `;

    return this.db.query(query);
  }
}

module.exports = {
  EdgeManager: EdgeManager,
};
