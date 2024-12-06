const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('neondb', 'neondb_owner', 'jRz2s1wZDWHQ', {
  host: 'ep-shrill-brook-a5rgplts.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Allows self-signed certificates
    },
  },
});

module.exports = sequelize;
