// const proxy = require('http-proxy-middleware');

// module.exports = function (app) {
//   app.use(proxy('/auth/**', { target: 'http://[::1]:5000' }));
//   app.use(proxy('/api/**', { target: 'http://[::1]:5000' }));
// };

//* in package.json before
// "proxy": {
//   "/auth/*": {
//     "target": "http://localhost:5000"
//   },
//   "/api/*": {
//     "target": "http://localhost:5000"
//   }
// },
