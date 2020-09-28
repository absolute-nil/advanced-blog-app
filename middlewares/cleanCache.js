const { clearHash } = require('../services/cache');
const keyProvider = require('../services/keyProvider');

module.exports = async (req, res, next) => {
  //* if we await next this middleware will run after
  //* the execution of the request
  await next();
  if (res.statusCode < 400) {
    const cacheKey = keyProvider(req, res);
    console.log('Cleaning cache for::: ', cacheKey);
    clearHash(cacheKey);
  }
};
