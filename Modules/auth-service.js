require("dotenv").config()
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{ dateTime: Date, userAgent: String }],
  })

let User = mongoose.model("User", userSchema)

const initialize = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB_URI)
    db.on("error", (err) => {
      console.error("Error connecting to the database:", err);

      reject(err)
    })
    db.once("open", () => {
      User = db.model("User", userSchema)
      console.log("Connected to the database successfully!");
      resolve("Schema created!")
    })
  })
}

const registerUser = async (userData) => {
  if (userData.password !== userData.password2) {
      throw new Error("Passwords do not match")
    }

    try {
      // Hash the user's password before storing it in the database
      const hashedPassword = await bcrypt.hash(userData.password, 10);
  
      const newUser = new User({
        userName: userData.userName,
        password: hashedPassword, // Store the hashed password
        email: userData.email,
        loginHistory: [],
      })
  
      await newUser.save()
      console.log("User registered:", newUser.userName)
    } catch (error) {
      if (error.code === 11000) {
        throw new Error("User Name already taken")
      } else {
        throw new Error("There was an error encrypting the password: " + error)
      }
    }
}

const checkUser = async (userData) => {
  try {
    const user = await User.findOne({ userName: userData.userName })

    if (!user) {
      throw new Error("Unable to find user: " + userData.userName)
    }

    const isMatch = await bcrypt.compare(userData.password, user.password)

    if (!isMatch) {
      throw new Error("Incorrect Password for user: " + userData.userName)
    }

    user.loginHistory.push({
      dateTime: new Date().toString(),
      userAgent: userData.userAgent,
    })

    await User.updateOne(
      { userName: user.userName },
      { $set: { loginHistory: user.loginHistory } }
    ).exec()

    return user
  } catch (err) {
    throw new Error("There was an error verifying the user: " + err.message)
  }
}

module.exports = { initialize, registerUser, checkUser }