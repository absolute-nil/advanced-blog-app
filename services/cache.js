const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
  //* legacy version commented just for reference
  //* object.assign is used to merge two objects
  //* both the objects are assigned to the empty obj {};
  // const key = Object.assign({}, this.getFilter(), {
  //   collection: this.mongooseCollection.name
  // } );

  const key = JSON.stringify({
    ...this.getFilter(),
    collection: this.mongooseCollection.name,
  });

  const cacheValue = await client.get(key);

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
  client.set(key, JSON.stringify(result));

  return result;
};
