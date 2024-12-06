/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Saurab Khadka Student ID: 148501224 Date: 2024/12/05
* 
*  Published URL: assignment5finalllllll.vercel.app
********************************************************************************/


const clientSessions = require("client-sessions")
const express = require('express')
const path = require('path')
const legoData = require("./Modules/legoSets") 
const authData = require("./Modules/auth-service")
const app = express()
const port = process.env.PORT || 8080



app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true })) // Add this line for form data parsing


app.use((req, res, next) => {
  res.locals.session = req.session
  next()
})

app.use(
  clientSessions({
    cookieName: 'session', // this is the object name that will be added to 'req'
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
)

app.use((req, res, next) => {
  res.locals.session = req.session
  next()
})


function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login")
  } else {
    next()
  }
}


app.get("/login", (req, res) => {
  res.render("login", { page: "/login", errorMessage: "" })
})

app.get("/register", (req, res) => {
  res.render("register", {
    page: "/register",
    errorMessage: "",
    successMessage: "",
  })
})

app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", {
        successMessage: "User created",
        errorMessage: "",
      })
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
        successMessage: "",
      })
    })
})

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: "", userName: "" })
})

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent")

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      }
      res.redirect("/lego/sets")
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName })
    })
})

app.get("/logout", (req, res) => {
  req.session.reset()
  res.redirect("/")
})

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { page: "/userHistory", user: req.session.user })
})

// Routes
app.get("/", (req, res) => {
  res.render("home")
})

app.get("/about", (req, res) => {
  res.render("about")
})

app.get('/lego/sets', async (req, res) => {
  const theme = req.query.theme;
  try {
    const sets = theme
      ? await legoData.getSetsByTheme(theme)
      : await legoData.getAllSets();
    if (sets.length === 0) {
      res
        .status(404)
        .render("404", { message: "No sets found for a matching theme" });
    } else {
      res.render("sets", { sets });
    }
  } catch (error) {
    res.status(500).render("500", { message: "Internal Server Error" });
  }
})

app.get('/lego/sets/:theme', async (req, res) => {
  try {
      const themeName = req.params.theme
      const sets = await legoData.getSetsByTheme(themeName)
      if (sets.length === 0) {
          res.status(404).render('404', { message: `No sets found for the theme "${themeName}"` })
      } else {
          res.render('sets', { sets })
      }
  } catch (err) {
      res.render('500', { message: `Error retrieving sets by theme: ${err.message}` })
  }
})

// Start the server

legoData.initialize()
  .then(authData.initialize)
  .then(
    app.listen(port, () => {
      console.log(`Server listening on: ${port}`)
    })
  )
  .catch((err) => {
    console.log(err, "Error initializing services") 
  })



app.get('/lego/set/:num', (req, res) => {
  legoData.initialize()
    .then(() => {
      const setNum = req.params.num
      return legoData.getSetByNum(setNum)
    })
    .then((set) => {
      res.render('set', { set })
    })
    .catch((err) => {
      console.error('Error fetching set details:', err)
      res.status(404).render('404', { message: `Set not found with set_num: ${req.params.num}` })
    })
})

app.get('/lego/addSet', (req, res) => {
  legoData.getAllThemes()
    .then(themeData => {
      res.render('addSet', { themes: themeData })
    })
    .catch(err => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` })
    })
})

app.post('/lego/addSet', (req, res) => {
  legoData.addSet(req.body)
    .then(() => {
      res.redirect('/lego/sets')
    })
    .catch(err => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` })
    })
})

app.get('/lego/editSet/:num', (req, res) => {
  const setNum = req.params.num

  Promise.all([legoData.getSetByNum(setNum), legoData.getAllThemes()])
    .then(([setData, themeData]) => {
      res.render('editSet', { set: setData, themes: themeData })
    })
    .catch((err) => {
      res.status(404).render('404', { message: `Unable to retrieve data: ${err}` })
    })
})


app.post('/lego/editSet', (req, res) => {
  const set_num = req.body.set_num
  const setData  = req.body

  legoData.editSet(set_num, setData)
    .then(() => {
      res.redirect(`/lego/sets`)
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` })
    })
})

app.get('/lego/deleteSet/:num', (req, res) => {
  const setNum = req.params.num

  legoData.deleteSet(setNum)
    .then(() => {
      res.redirect('/lego/sets')
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` })
    })
})




/*
async function run() {
    await legoData.initialize() // testing functions

    const allSets = legoData.getAllSets()
    console.log(allSets)

    const specificSet = await legoData.getSetByNum("0003977811-1")
    console.log(specificSet)
}

run().catch(console.error)
*/