const _ = require('lodash');
const ModelBase = require('./base');

const { Sequelize } = global.restapi;

module.exports = (sequelize) => {
  return _.extend(sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(30),
      allowNull: false,
      validate: {
        len: [2, 30],
      },
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
      unique: true,
      comment: '用户email地址',
    },
    role: {
      type: Sequelize.ENUM,
      values: ['admin', 'member'],
      defaultValue: 'member',
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM,
      values: ['disabled', 'enabled'],
      defaultValue: 'enabled',
      allowNull: false,
      comment: '是否可用',
    },
    language: {
      type: Sequelize.STRING,
      defaultValue: 'zh',
      allowNull: false,
      comment: '当前用户的语言设置',
    },
    isDelete: {
      type: Sequelize.ENUM,
      values: ['yes', 'no'],
      defaultValue: 'no',
      allowNull: false,
      comment: '是否被删除',
    },
  }, {
    comment: '系统用户表',
    freezeTableName: true,
    // hooks: {
    //   beforeValidate: (user) => {
    //     if (user.isNewRecord) user.salt = U.randStr(10);
    //   },
    //   beforeCreate: CALC_PASS,
    //   beforeUpdate: CALC_PASS
    // },

    instanceMethods: {
      /** 这里之所以要单独定义 toJSON 是为了隐藏 salt 和 password 对外 */
      // toJSON() {
      //   _.omit(this.get(), 'password', 'salt');
      // },
    },

    classMethods: {
      findByEmail(email) {
        return this.findOne({ where: { email } });
      },
    },
  }), ModelBase, {
    unique: ['email'],
    sort: {
      default: 'createdAt',
      defaultDirection: 'ASC',
      allow: ['id', 'name', 'email', 'status', 'updatedAt', 'createdAt'],
    },
    writableCols: [
      'email', 'name', 'status', 'role', 'language',
    ],
    editableCols: [
      'name', 'role', 'status', 'role', 'language',
    ],
    /** 只有管理员才可以修改的字段 */
    onlyAdminCols: ['role', 'status'],

    /** 定义允许包含返回的字段，不设置为全部 */
    allowIncludeCols: [
      'id', 'name',
    ],
  });
};
