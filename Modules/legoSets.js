const fs = require("fs");
require("dotenv").config();
const Sequelize = require("sequelize");
const setData = [];
const themeData = [];

let sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    dialectModule: require("pg"),
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Connection has been established successfully."))
  .catch((err) => console.log("Unable to connect to the database:", err));

const Theme = sequelize.define(
  "Theme",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

const Set = sequelize.define(
  "Set",
  {
    set_num: { type: Sequelize.STRING, primaryKey: true },
    name: { type: Sequelize.STRING },
    year: { type: Sequelize.INTEGER },
    num_parts: { type: Sequelize.INTEGER },
    theme_id: { type: Sequelize.INTEGER },
    img_url: { type: Sequelize.STRING },
  },
  { timestamps: false }
);

Set.belongsTo(Theme, { foreignKey: "theme_id" });

function initialize() {
  return sequelize
    .sync()
    .then(() => {
      sets = [];
      setData.forEach((set) => {
        const theme =
          themeData.find((theme) => theme.id === set.theme_id)?.name ||
          "unknown";
        sets.push({
          ...set,
          theme,
        });
      });
      return Promise.resolve();
    })
    .catch((error) => Promise.reject("Initializing failed: " + error.message));
}

function getAllSets() {
  return Set.findAll({ include: [Theme] })
    .then((sets) => {
      if (sets.length > 0) {
        const setsWithTheme = sets.map((set) => ({
          ...set.toJSON(),
          theme: set.Theme?.name || "unknown",
        }));
        return setsWithTheme;
      } else {
        return Promise.reject("No sets found.");
      }
    })
    .catch((error) => Promise.reject("Error retrieving sets: " + error.message));
}

function getSetByNum(setNum) {
  return Set.findOne({ where: { set_num: setNum } })
    .then((set) => {
      if (set) {
        return set;
      } else {
        return Promise.reject(
          `Unable to find requested set with number ${setNum}`
        );
      }
    })
    .catch((error) =>
      Promise.reject("Error retrieving set: " + error.message)
    );
}

function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme],
    where: {
      "$Theme.name$": {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  })
    .then((sets) => {
      if (sets.length > 0) {
        const setsWithTheme = sets.map((set) => ({
          ...set.toJSON(),
          theme: set.Theme?.name || "unknown",
        }));
        return setsWithTheme;
      } else {
        return Promise.reject(
          `Unable to find requested sets for theme: ${theme}`
        );
      }
    })
    .catch((error) => Promise.reject("Error retrieving sets: " + error.message));
}

function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => resolve())
      .catch((err) => reject(err.errors[0].message));
  });
}

function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then((themes) => resolve(themes))
      .catch((error) => reject("Error retrieving themes: " + error.message));
  });
}

function editSet(set_num, setData) {
  return Set.update(setData, { where: { set_num: set_num } })
    .then((affectedRows) => {
      if (affectedRows[0] === 0) {
        return Promise.reject(
          "No set was updated. Please check the set number."
        );
      }
      return Promise.resolve();
    })
    .catch((err) =>
      Promise.reject(
        err.errors?.[0]?.message || "An error occurred while updating the set."
      )
    );
}

function deleteSet(set_num) {
  return Set.destroy({ where: { set_num: set_num } })
    .then((deleted) => {
      if (deleted === 0) {
        return Promise.reject(`Set with number ${set_num} not found.`);
      }
      return Promise.resolve();
    })
    .catch((err) =>
      Promise.reject(err.errors ? err.errors[0].message : err.message)
    );
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
  sequelize,
};
