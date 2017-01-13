module.exports = {
  // web server 的一些信息
  name: 'PlanMaster API',
  host: 'localhost',
  port: 8008,

  // 站点地址
  siteUrl: 'http://www.planning.com',

  // 时间，日期格式化的格式
  dateFormat: 'YYYY-MM-DD',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',

  // 核心内置 中间件开关 和顺序
  coreMiddlewares: {
    acceptParser: true,
    queryParser: true,
    bodyParser: true,
    ipFilter: true,
    charset: true,
    accessLog: true,
  },

  // 自定义 中间件 开关和顺序
  externalMiddlewares: {
    console: true,
  },

  // 路由相关设置
  route: {
    // 展示 所有API 列表
    apis: '/apis',
    // 公开访问的路由
    publicRoutes: [],
  },

  // 数据库相关配置
  database: {
    host: '127.0.0.1',
    port: 3306,
    name: 'test',
    encode: {
      set: 'utf8',
      collation: 'utf8_general_ci',
    },
    user: 'root',
    pass: 'root',
    dialect: 'mysql',
    dialectOptions: {
      supportBigNumbers: true,
    },
    logging: false,
    define: {
      underscored: false,
      freezeTableName: true,
      syncOnAssociation: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
    },
    syncOnAssociation: true,
    pool: {
      min: 2,
      max: 10,
      // 单位毫秒
      idle: 300 * 1000,
    },
  },

  // IP 过滤配置
  ipFilter: {
    whiteList: [],
    blackList: [],
  },
  // bodyParser: {
  //   maxBodySize: 0,
  //   mapParams: true,
  //   overrideParams: false,
  // },
  // queryParser: {
  //   mapParams: true,
  // },
  // charset: {
  //   charset: 'utf-8',
  // },
};
