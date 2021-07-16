const { DataSource } = require('apollo-datasource');
const hash = require('object-hash');

/**
 * An ArangoDb implementation of the Apollo DataSource.
 *
 * @class ArangoDataSource
 * @extends {DataSource}
 */
class ArangoDataSource extends DataSource {
  /**
   * Creates an instance of ArangoDataSource.
   * @param {Database} db
   * @memberof ArangoDataSource
   */
  constructor(db) {
    super();
    this.db = db;
  }

  /**
   * Initializes the DataSource.
   *
   * Called at the beginning of each request.
   *
   * @param {*} config A configuration object that provides access to the shared cache and request context.
   * @memberof ArangoDataSource
   */
  initialize(config) {
    this.cache = config.cache;
  }

  /**
   * Query the database.
   *
   * Options:
   * useCache: check the cache first and update
   *
   * @param {*} query The query to use
   * @returns {*} A list of results that match the query
   * @memberof ArangoDataSource
   */
  async query(query, { useCache } = { useCache: true }) {
    if (useCache) {
      const cachedValue = await this.queryCached(query);

      if (cachedValue) {
        return cachedValue;
      }
    }

    const cursor = await this.db.query(query);
    const result = await cursor.all();

    if (useCache && result) {
      await this.addToCache(query, result);
    }

    return result;
  }

  /**
   * Compute the key for a given query
   *
   * @private
   * @param {*} query The query to compute the key for
   * @returns {string} A string key for the query
   * @memberof ArangoDataSource
   */
  getCacheKeyForQuery(query) {
    return hash(query);
  }

  /**
   * Check the cache for previously saved results for the given query
   *
   * @private
   * @param {*} query The query to check for
   * @returns {*} The results saved to the cache
   * @memberof ArangoDataSource
   */
  async queryCached(query) {
    const key = this.getCacheKeyForQuery(query);
    let result =  await this.cache.get(key);
    if(result?.length) {
      try {
        result = JSON.parse(result);
      } catch (error) {
        // Dont handle error 
      }
    }
    return result
  }

  /**
   * Add a result set to the cache using the query as a key
   *
   * @param {*} query The query to key by
   * @param {*} result The results to add to the cache
   * @memberof ArangoDataSource
   */
  async addToCache(query, result) {
    const key = this.getCacheKeyForQuery(query);
    const value = typeof result === 'object'? JSON.stringify(result) : result; 
    await this.cache.set(key, value);
  }
}

module.exports = {
  ArangoDataSource: ArangoDataSource,
};
