const Sequelize = require('sequelize');
const sequelize = require('../config/dbConfig');
const Theme = require('./theme');

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  num_parts: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  theme_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  img_url: {
    type: Sequelize.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

module.exports = Set;
