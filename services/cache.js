const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this._cache = true;
  this._hashKey = JSON.stringify(options.key || '');
  return this;
};

mongoose.Query.prototype.exec = async function () {
  //* legacy version commented just for reference
  //* object.assign is used to merge two objects
  //* both the objects are assigned to the empty obj {};
  // const key = Object.assign({}, this.getFilter(), {
  //   collection: this.mongooseCollection.name
  // } );

  if (!this._cache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });

  const cacheValue = await client.hget(this._hashKey, key);

  if (cacheValue) {
    console.log('From cache');
    // exec expects to return a mongoose document that
    // resolves with a promise

    const doc = JSON.parse(cacheValue);

    // this convers the array of objects or a single object into
    // array of mongoose doc or a single doc respectively
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);
  console.log('Setting cache for::: ', this._hashKey);
  client.hset(this._hashKey, key, JSON.stringify(result));
  client.expire(this._hashKey, 10);

  return result;
};

module.exports = {
  clearHash(_hashKey) {
    client.del(JSON.stringify(_hashKey) || '');
  },
};
