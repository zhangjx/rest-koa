const _ = require('lodash');

module.exports = {
  list(Model) {
    console.log('I am user list helper');
    return (req, res, next) => {
      Model.findAll().then((users) => {
        users = _.map(users, (u) => u.toJSON());
        // console.log(users);
        res.send(users);
        return next();
      });
    };
  },
};
