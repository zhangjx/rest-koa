// User = restapi.model('user');

module.exports = {
  index() {
    return (req, res, next) => {
      res.send(200, 'hello, world!');
      // restapi.log.info('hhhhhhhhhh');
      next();
    };
  },

  // users: (req, res, next) => {
  //   restapi.models.user.findAll().then((users) => {
  //     users = _.map(users, (u) => u.toJSON());
  //     console.log(users);
  //     return res.send(users);
  //   });
  // },

  users() {
    const User = restapi.models('user');
    return [
      restapi.helpers.console.info('I an user route'),
      restapi.helpers.rest.list(User),
    ];
  },
};
