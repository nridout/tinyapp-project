// MODULES
const express = require("express")
const bodyParser = require("body-parser")
var cookieSession = require('cookie-session')
const app = express()
const bcrypt = require('bcrypt')
const PORT = 3000 // default port 3000


// EJS VIEW ENGINE
app.set("view engine", "ejs")

// ---------------------------------------------------------------------------------- //

//                                    MIDDLEWARE

// ---------------------------------------------------------------------------------- //

// formats the response from the original url submission
app.use(bodyParser.urlencoded({ extended: true }))

// Parse Cookie header and populate req.cookies with an object keyed by the cookie names
app.use(cookieSession({
  name: 'session',
  keys: ["1353462werwr2323r6"],
}))

// ---------------------------------------------------------------------------------- //

//                                      ROUTES

// ---------------------------------------------------------------------------------- //

// ** DATABASES **

// URL Database
const urlDatabase = {
  '4cef9b': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: "userRandomID"
  },
  '5ce85d': {
    longURL: 'http://www.test.ca',
    userID: "user2RandomID"
  },
  '1a4aa5': {
    longURL: 'http://www.google.ca',
    userID: "ambellina23"
  },
  '1a4asd': {
    longURL: 'http://www.testsite.ca',
    userID: "ambellina23"
  },
  '4ceseb': {
    longURL: 'http://www.lighthouse.ca',
    userID: "userRandomID"
  },
}

// User Database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "ambellina23": {
    id: "ambellina23",
    email: "nicole.ridout@gmail.com",
    password: "password"
  },
}


// HOMEPAGE ---- /
// ---------------------------------------------------------------------------------- //

// Sets the template for the Homepage
app.get("/", (req, res) => {
  let templateVars = {
    userInfo: users[req.session.user_id]
  }
  res.render("urls_home", templateVars)
})


// USER URL INDEX ---- /urls
// ---------------------------------------------------------------------------------- //

// -- GET /urls -- //

// Sets the template for the custom urls
app.get("/urls", (req, res) => {
  // Check if the user is registered & logged in
  if (!req.session.user_id) {
    // Return error message asking user to log in
    return res.status(401).send('Request Denied, please log in')
  } else {
    let userInfo = users[req.session.user_id]
    // Sets the user database with the user's custom URLs
    let userURLdatabase = urlsForUser(req.session.user_id)
    let templateVars = {
      userInfo: userInfo,
      urls: userURLdatabase
    }
    res.render("urls_index", templateVars)
  }
})

// -- FUNCTIONS -- //

// Function that filters the urlDatabase by user id
// And returns an object with the user's custom URLs
const urlsForUser = user_id => {
  const userURLs = {}
  for (shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user_id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL
    }
  }
  return userURLs
}

// Function that checks if the user owns a given short URL
const userOwnsURL = function (givenShortURL, user_id) {
  let userURLdatabase = urlsForUser(user_id)
  for (shortURL in userURLdatabase) {
    if (shortURL === givenShortURL) {
      return true
    }
  }
}

// -- POST /urls -- //

// Generates a custom short URL for a given long URL &
// Redirects the user to the custom URL id page upon submission
app.post("/urls", (req, res) => {
  // Assigns a random string to the short URL
  let randomString = generateRandomString()
  let longURL = req.body.longURL
  let user_id = req.session.user_id
  // Adds the new custom url to the url Database
  urlDatabase[randomString] = {
    'longURL': longURL,
    'userID' : user_id
  }
  var redirectRandom = "/urls/" + randomString
  res.redirect(redirectRandom)
})

// function that generates a random string for the short url
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1)
}


// CREATE NEW URL ---- /urls/new
// ---------------------------------------------------------------------------------- //

// -- GET /urls/new -- //

// sets the template for the short URL generation page
app.get("/urls/new", (req, res) => {
  // Check if the user is logged in
  if (!req.session.user_id) {
    // Return error message asking user to log in
    return res.status(401).send('Request Denied, please log in')
  } else {
    let templateVars = {
      userInfo: users[req.session.user_id]
    }
    res.render("urls_new", templateVars)
  }
})


// CUSTOM URL ID PAGE ---- /urls/:id
// ---------------------------------------------------------------------------------- //

// -- GET /urls/:id -- //

// sets the template for the unique id short URL page
app.get("/urls/:shortURL", (req, res) => {
  shortURL = req.params.shortURL
  // Check if the user is logged in & owns url for given id
  if (!req.session.user_id || !userOwnsURL(shortURL, req.session.user_id)) {
    // Return error message asking user to log in
    return res.status(401).send( 'Request Denied, please log in' )
  } else {
    let templateVars = {
      userInfo: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
    }
    res.render("urls_show", templateVars)
  }
})

// -- POST /urls/:id -- //

// Deletes custom urls
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL
  // Check if the user is logged in & has url in userdb
  if (!req.session.user_id && !userOwnsURL(shortURL)) {
    return res.status(401).send ('Request Denied, please log in')
  } else {
    delete (urlDatabase[shortURL])
  res.redirect("/urls")
  }
})

// Reassigns custom url to new long url
app.post("/urls/:id", (req, res) => {
  let user_id = req.session.user_id
  let shortURL = req.params.id
  let longURL = req.body.longURL
  // Updates the database with the new long url
  urlDatabase[shortURL] = {
    'longURL': longURL,
    'userID': user_id
  }
    // Redirects user back to the URL Index
    res.redirect("/urls")
})


// SHORT URL REDIRECT ---- /u/:id
// ---------------------------------------------------------------------------------- //

// -- GET /u/:id-- //

// Redirects the long URL to the short URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  if (!foundURL(shortURL)) {
    // Return error message if page does not exist
    return res.status(404).send('Page does not exist')
  } else {
  const longURL = urlDatabase[req.params.shortURL]["longURL"]
  res.redirect(longURL)
  }
})

// -- FUNCTIONS -- //

// Checks if url is in the url database
const foundURL = inputURL => {
  for (shortURL in urlDatabase) {
    if (shortURL === inputURL) {
      return true
    }
  }
}


// LOGIN ---- /login
// ---------------------------------------------------------------------------------- //

// -- GET /login -- //

// Sets template for the login page
app.get("/login", (req, res) => {
  let templateVars = {
    userInfo: users[req.session.user_id]
  }
  res.render("urls_login", templateVars)
})

// -- POST /login -- //

// Handles the Login Submission
app.post("/login", (req, res) => {
  const email = req.body.email
  const checkEmail = found(req.body.email)
  const password = req.body.password
  let user_id = correctPassword(password, email)

  // Checks that the email does exist in the user db
  if (!checkEmail) {
    return res.status(403).send('User not found')

    // Checks that the email & password match
  } else if (!user_id) {
    return res.status(403).send('Password incorrect')

    // Sets the cookie to the user_id & redirects to urls page
  } else {
    req.session.user_id = user_id
    res.redirect("/urls")
  }
})

// -- FUNCTIONS -- //

// Checks that the UserID & Password Match
// If they match, returns the user id
const correctPassword = (inputPassword, inputEmail) => {
  let passwordsMatch = bcrypt.compareSync(inputPassword, users[id].password)
  for (id in users) {
    if (users[id].email === inputEmail && passwordsMatch) {
      return users[id].id
    }
  }
}


// REGISTER ---- /register
// ---------------------------------------------------------------------------------- //

// -- GET /register-- //

// Sets the template for the Register Page
app.get("/register", (req, res) => {
  let templateVars = {
    userInfo: users[req.session.user_id]
  }
  res.render("urls_register", templateVars)
})

// -- POST /register -- //

// Handles Registration Submission
app.post("/register", (req, res) => {
  // Generates a random user id
  const id = generateRandomString()
  // Req email & password from Registration Form
  const email = req.body.email
  const password = req.body.password
  // Hashes password
  const hashedPassword = bcrypt.hashSync(password, 10)

  // Checks that the user has submitted an email & password
  if (email === "" || password === "") {
    return res.status(400).send('Please enter and email and password')

    // Checks that the user email is not already in the database
  } else if (found(email)) {
    return res.status(404).send('This email already exists')

    // If both conditions met, creates new user in the user database
  } else {
    users[id] = {
      id: id,
      email: email,
      password: hashedPassword
    }
  }
  // Sets the user id cookie to the user id
  req.session.user_id = id
  // Redirects user to the urls page
  res.redirect("/urls")
})

// -- FUNCTIONS -- //

// Checks if email is already in the user database
const found = inputEmail => {
  for (id in users) {
    if (users[id].email === inputEmail) {
      return true
    }
  }
}


// LOGOUT ---- /logout
// ---------------------------------------------------------------------------------- //

// -- POST /logout -- //

// Handles logout
app.post("/logout", (req, res) => {
  // Deletes session cookie
  let user_id = req.body.user_id
  req.session = null
  // Redirects to the login page
  res.redirect("/login")
})


// PORT LISTENER
// ---------------------------------------------------------------------------------- //

// Console message indicating which port the server is running on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})