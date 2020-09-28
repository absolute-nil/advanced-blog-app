module.exports = function KeyProvider(req, res) {
  if (req.method === 'POST' && req.path.includes('blogs')) {
    return req.user.id;
  }
};
