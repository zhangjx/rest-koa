/**
 * API routes
 */

module.exports = (router) => {
  /** 首页默认路由 */
  router.get('/', 'home.index');

  router.get('/users', 'home.users');

  // /** 用户登陆接口 */
  // route.post('/session', 'user.login');

  // /** 用户退出接口 */
  // route.del('/session', 'user.logout');

  // /** 用户查看自身信息接口 */
  // route.get('/session', 'user.session');

  // /** 用户接口 */
  // route.resource('user');
};
