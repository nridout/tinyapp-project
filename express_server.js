// Required modules
const express = require("express")
const bodyParser = require("body-parser")
var cookieSession = require('cookie-session')
const app = express()
const bcrypt = require('bcrypt');
const PORT = 3000 // default port 3000 because 8080 isn't working for me


// Sets the view engine to ejs
app.set("view engine", "ejs")

// MIDDLEWARE

// formats the response from the original url submission
app.use(bodyParser.urlencoded({ extended: true }))

// Parse Cookie header and populate req.cookies with an object keyed by the cookie names
app.use(cookieSession({
  name: 'session',
  keys: ["13534626"],
}))

// ROUTES

// ** DATABASES **

// URL Database
const urlDatabase = {}

// User Database
const users = {}


// ---ROOT HOMEPAGE

// sets the template for the root (homepage)
app.get("/", (req, res) => {

  let templateVars = {
    userInfo: users[req.session.user_id]
  }

  res.render("urls_home", templateVars)
})

// --- REGISTER

// template for the register page
app.get("/register", (req, res) => {

  let templateVars = {
    userInfo: users[req.session.user_id]
  }

  res.render("urls_register", templateVars)
})

// Handles Registration Submission
app.post("/register", (req, res) => {
  const id = generateRandomString() // Generates a random user id
  const email = req.body.email
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);
  // Checks that the user has submitted an email & password
  if (email === "" || password === "" ) {
    return res.status(400).json({ message: 'Contact name is required' })
  // Checks that the user email is not already in the database
  } else if (found(email)) {
    return res.status(404).json({ message: 'This email already exists' })
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

// Checks if email is already in the user database
const found = inputEmail => {
  for (id in users) {
    if (users[id].email === inputEmail) {
      return true
    }
  }
}

// --- LOGIN

// template for the login page
app.get("/login", (req, res) => {
  let templateVars = {
    userInfo: users[req.session.user_id]
  }
  res.render("urls_login", templateVars)
})

// Handles the Login Submission
app.post("/login", (req, res) => {
  const email = req.body.email
  const checkEmail = found(req.body.email)
  const password = req.body.password
  let user_id = correctPassword(password, email)
  // Checks that the email does exist in the user db
  if (!checkEmail) {
    return res.status(403).json({ message: 'User not found' })
  // Checks that the email & password match
  } else if (!user_id) {
    return res.status(403).json({ message: 'Password incorrect' })
  // sets the cookie to the user_id & redirects to urls page
  } else {
    req.session.user_id = user_id
    res.redirect("/urls")
  }
})

// Checks that the UserID & Password Match
// If they match, returns the user id
const correctPassword = (inputPassword, inputEmail)  => {
  let passwordsMatch = bcrypt.compareSync(inputPassword, users[id].password)
  for (id in users) {
    if (users[id].email === inputEmail && passwordsMatch) {
      return users[id].id
    }
  }
}

// --- LOGOUT

// deletes user cookie when user logs out
app.post("/logout", (req, res) => {

  let user_id = req.body.user_id
  req.session = null
  res.redirect("/login")
})

// ---URL INDEX

// sets the template for the list of all long & short urls
// exports the database info to the template
app.get("/urls", (req, res) => {
  console.log(req.session.user_id)
  // Check if the user is registered & logged in
  if (!req.session.user_id) {
    // redirect unregistered users to login page
    res.redirect("/login")
  } else {
    let userInfo = users[req.session.user_id]
    // let user_id = req.session.user_id
    let userURLdatabase = urlsForUser(req.session.user_id) //userURLdatabase
    let templateVars = {
      userInfo: userInfo,
      urls: userURLdatabase
    }

    console.log(userURLdatabase)
    res.render("urls_index", templateVars)
  }
})

// filters the urlDatabase by user id
const urlsForUser = user_id => {
  const userURLs = {}
  for (shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user_id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL
    }
  }
  return userURLs
}

//checks if shortURL is in user DB
// filters the urlDatabase by user id
const userOwnsURL = function (userShortURL, user_id) {
  let userURLdatabase = urlsForUser(user_id)
  for (shortURL in userURLdatabase) {
    if (shortURL === userShortURL) {
      return true
    }
  }
}


// collects the input from the "long URL" form
// assigns a random string to the short URL
// generates a unique id page for the short URL
// redirects the user to the unique id page upon submission
app.post("/urls", (req, res) => {
  let randomString = generateRandomString()
  let longURL = req.body.longURL
  let user_id = req.session.user_id
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

// ---NEW URL

// sets the template for the short URL generation page
app.get("/urls/new", (req, res) => {
  // Check if the user is registered & logged in
  if (!req.session.user_id) {
    // redirect unregistered users to login page
    res.redirect("/login")
  } else {
    let templateVars = {
      userInfo: users[req.session.user_id]
    }
    res.render("urls_new", templateVars)
  }

})

// ---URL ID PAGE

// sets the template for the unique id short URL page
app.get("/urls/:shortURL", (req, res) => {
  shortURL = req.params.shortURL
  // Check if the user is registered & logged in & has url in userdb
  if (!req.session.user_id || !userOwnsURL(shortURL, req.session.user_id)) {
    // redirect unregistered users to login page
    return res.status(401).json({ message: 'Request Denied, please log in to delete your link' })
  } else {
    let templateVars = {
      userInfo: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
    }
    res.render("urls_show", templateVars)
    console.log(longURL)
  }
})

// deletes short urls
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL
  // Check if the user is registered & logged in & has url in userdb
  if (!req.session.user_id && !userOwnsURL(shortURL)) {
    return res.status(401).json({ message: 'Request Denied, please log in to delete your link' })
  } else {
    delete (urlDatabase[shortURL])
  res.redirect("/urls")
  }
})



// reassigns shorty to a new url
app.post("/urls/:id", (req, res) => {
  let user_id = req.session.user_id
  let shortURL = req.params.id
  let longURL = req.body.longURL
  urlDatabase[shortURL] = {
    'longURL': longURL,
    'userID': user_id
  }
    res.redirect(shortURL)
});

// ---SHORT URL REDIRECT

// redirects the long URL to the short URL
// when the unique key is added to the /u/ path
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL)
})

// PORT LISTENER

// console message indicating which port the server is running on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})