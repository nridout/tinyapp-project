// Required modules
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const app = express()
const PORT = 3000 // default port 3000 because 8080 isn't working for me


// Sets the view engine to ejs
app.set("view engine", "ejs")

// MIDDLEWARE

// formats the response from the original url submission
app.use(bodyParser.urlencoded({ extended: true }))

// Parse Cookie header and populate req.cookies with an object keyed by the cookie names
app.use(cookieParser())

// ROUTES

// ** DATABASES **

// URL Database
var urlDatabase = {
  '4cef9b': 'http://www.lighthouselabs.ca',
  '5ce85d': 'http://www.test.ca',
  '1a4aa5': 'http://www.google.ca',
}

// User Database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
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

// ---ROOT HOMEPAGE

// sets the template for the root (homepage)
app.get("/", (req, res) => {
  res.redirect("/urls/new")
})

// --- REGISTER

// template for the register page
app.get("/register", (req, res) => {

  let templateVars = {
    userInfo: users[req.cookies["user_id"]]
  }

  res.render("urls_register", templateVars)
})

// Handles Registration Submission
app.post("/register", (req, res) => {
  const id = generateRandomString() // Generates a random user id
  const email = req.body.email
  const password = req.body.password
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
      password: password
    }
  }
  // Sets the user id cookie to the user id
  res.cookie("user_id", id)
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
    userInfo: users[req.cookies["user_id"]]
  }
  res.render("urls_login", templateVars)
})

// %#%%%%%%%%%%%%%%% re-comment
app.post("/login", (req, res) => {
  const checkEmail = found(req.body.email)
  const user_id = correctPassword(req.body.password, req.body.email)

  if (!checkEmail) {
    return res.status(403).json({ message: 'User not found' })
  } else if (!user_id) {
    return res.status(403).json({ message: 'Password incorrect' })
  } else {
    res.cookie("user_id", user_id)
    res.redirect("/urls")
  }
})

// If correct password, return user id
const correctPassword = (inputPassword, inputEmail)  => {
  for (id in users) {
    if (users[id].email === inputEmail && users[id].password === inputPassword) {
      return users[id].id
    }
  }
}


// --- LOGOUT

// deletes user cookie when user logs out
app.post("/logout", (req, res) => {
  let user_id = req.body.user_id
  res.clearCookie("user_id", user_id)
  res.redirect("/urls")
})

// ---URL LIST

// sets the template for the list of all long & short urls
// exports the database info to the template
app.get("/urls", (req, res) => {
  let templateVars = {
    userInfo: users[req.cookies["user_id"]],
    urls: urlDatabase
  }
  res.render("urls_index", templateVars)
})

// collects the input from the "long URL" form
// assigns a random string to the short URL
// generates a unique id page for the short URL
// redirects the user to the unique id page upon submission
app.post("/urls", (req, res) => {
  let randomString = generateRandomString()
  let longURL = req.body.longURL
  urlDatabase[randomString] = longURL
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
  let templateVars = {
    userInfo: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars)
})

// ---URL ID PAGE

// sets the template for the unique id short URL page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    userInfo: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }
  res.render("urls_show", templateVars)
})

// deletes short urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete(urlDatabase[req.params.shortURL])
  res.redirect("/urls")
})

// reassigns shorty to a new url
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = req.body.longURL
  urlDatabase[shortURL] = longURL
  res.redirect(shortURL)
});

// ---SHORT URL REDIRECT

// redirects the long URL to the short URL
// when the unique key is added to the /u/ path
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
})

// PORT LISTENER

// console message indicating which port the server is running on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})