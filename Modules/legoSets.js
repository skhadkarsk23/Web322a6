
const fs = require("fs");

require("dotenv").config();

const Sequelize = require("sequelize");
const setData = [];
const themeData = [];

// set up sequelize to point to our postgres database
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
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

// Define Theme model
const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false, // Disable createdAt and updatedAt
  }
);

// Define Set model
const Set = sequelize.define(
  "Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    year: {
      type: Sequelize.INTEGER,
    },
    num_parts: {
      type: Sequelize.INTEGER,
    },
    theme_id: {
      type: Sequelize.INTEGER,
    },
    img_url: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false, // Disable createdAt and updatedAt
  }
);

// Create the association
Set.belongsTo(Theme, { foreignKey: "theme_id" });

function initialize() {
  return sequelize
    .sync() // Sync all models with the database
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
      return Promise.resolve(); // Resolve with no data
    })
    .catch((error) => {
      return Promise.reject("Initializing failed: " + error.message); // Reject with error message
    });
}

function getAllSets() {
  return Set.findAll({ include: [Theme] }) // Fetch all sets and include their associated Theme
    .then((sets) => {
      if (sets.length > 0) {
        // Map the sets to include the theme name as `set.theme`
        const setsWithTheme = sets.map((set) => ({
          ...set.toJSON(), // Convert Sequelize instance to plain object
          theme: set.Theme?.name || "unknown", // Add the theme name
        }));
        return setsWithTheme; // Resolve with the transformed sets
      } else {
        return Promise.reject("No sets found."); // Reject if no sets are found
      }
    })
    .catch((error) => {
      return Promise.reject("Error retrieving sets: " + error.message); // Reject with the error message
    });
}

function getSetByNum(setNum) {
  return Set.findOne({ where: { set_num: setNum } }) // Query the Set model for the specific set_num
    .then((set) => {
      if (set) {
        return set; // Resolve with the matched set
      } else {
        return Promise.reject(
          `Unable to find requested set with number ${setNum}`
        ); // Reject if no set is found
      }
    })
    .catch((error) => {
      return Promise.reject("Error retrieving set: " + error.message); // Reject with an error message
    });
}

function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme], // Include Theme data in the result
    where: {
      "$Theme.name$": {
        [Sequelize.Op.iLike]: `%${theme}%`, // Case-insensitive matching of theme name
      },
    },
  })
    .then((sets) => {
      if (sets.length > 0) {
        // Map the sets to include the theme name as `set.theme`
        const setsWithTheme = sets.map((set) => ({
          ...set.toJSON(), // Convert Sequelize instance to plain object
          theme: set.Theme?.name || "unknown", // Add the theme name
        }));
        return setsWithTheme; // Resolve with the transformed sets
      } else {
        return Promise.reject(
          `Unable to find requested sets for theme: ${theme}`
        ); // Reject if no sets were found
      }
    })
    .catch((error) => {
      return Promise.reject("Error retrieving sets: " + error.message); // Reject if there's an error in the query
    });
}

// Add a new set to the database
function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => resolve()) // Resolve the promise with no data
      .catch((err) => {
        // Reject with the first error message
        reject(err.errors[0].message);
      });
  });
}

// Get all themes from the database
function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then((themes) => resolve(themes)) // Resolve with themes data
      .catch((error) => reject("Error retrieving themes: " + error.message)); // Reject with an error message
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
      return Promise.resolve(); // Successfully updated
    })
    .catch((err) => {
      return Promise.reject(
        err.errors?.[0]?.message || "An error occurred while updating the set."
      );
    });
}

// Delete Set Function
function deleteSet(set_num) {
  return Set.destroy({ where: { set_num: set_num } })
    .then((deleted) => {
      if (deleted === 0) {
        // If no rows are deleted (i.e., set doesn't exist), reject the promise
        return Promise.reject(`Set with number ${set_num} not found.`);
      }
      return Promise.resolve(); // Resolve with no data once deletion is successful
    })
    .catch((err) => {
      return Promise.reject(err.errors ? err.errors[0].message : err.message); // Provide human-readable error
    });
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