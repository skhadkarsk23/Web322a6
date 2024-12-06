require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Define the schema for User
const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [{ dateTime: Date, userAgent: String }],
});

// Create the User model based on the schema
let User = mongoose.model('User', userSchema);

// Initialize MongoDB connection
const initialize = () => {
  return new Promise((resolve, reject) => {
    // Use the MongoDB URI stored in the environment variable
    mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log('Connected to the database successfully!');
        resolve('Database initialized!');
      })
      .catch((err) => {
        console.error('Error connecting to the database:', err);
        reject(err);
      });
  });
};

// Register a new user
const registerUser = async (userData) => {
  if (userData.password !== userData.password2) {
    throw new Error('Passwords do not match');
  }

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = new User({
      userName: userData.userName,
      password: hashedPassword, // Store hashed password
      email: userData.email,
      loginHistory: [],
    });

    await newUser.save(); // Save the new user to the database
    console.log('User registered:', newUser.userName);
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('User Name already taken');
    } else {
      throw new Error('Error registering user: ' + error.message);
    }
  }
};

// Check the credentials of a user during login
const checkUser = async (userData) => {
  try {
    // Find the user by their userName
    const user = await User.findOne({ userName: userData.userName });

    if (!user) {
      throw new Error('Unable to find user: ' + userData.userName);
    }

    // Compare the password entered with the hashed password in the database
    const isMatch = await bcrypt.compare(userData.password, user.password);

    if (!isMatch) {
      throw new Error('Incorrect Password for user: ' + userData.userName);
    }

    // Update the loginHistory with current login details
    user.loginHistory.push({
      dateTime: new Date().toString(),
      userAgent: userData.userAgent,
    });

    // Save the updated loginHistory to the database
    await User.updateOne(
      { userName: user.userName },
      { $set: { loginHistory: user.loginHistory } }
    );

    return user; // Return the user object if authentication is successful
  } catch (err) {
    throw new Error('Error verifying the user: ' + err.message);
  }
};

module.exports = { initialize, registerUser, checkUser };
