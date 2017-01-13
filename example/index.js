const OpenRestWrap = require('../');

const restapi = new OpenRestWrap();
restapi.start();

// restapi.app.get('/', (req, res, next) => {
//   res.send(200, 'hello, world!');
//   restapi.log.info('hhhhhhhhhh');
//   return next();
// });
