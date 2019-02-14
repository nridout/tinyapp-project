// import express, the web application framework
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const app = express()
const PORT = 3000 // default port 3000 because 8080 isn't working for me


// sets the view engine to ejs, a templating language that generates HTML markup with plain JavaScript
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
  }
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
    username: req.cookies["username"]
  }
  res.render("urls_register", templateVars)
})

// handles registration submission
// creates new user in the user database & generates random user id
// sets user id cookie
// redirects to the urls page
app.post("/register", (req, res) => {
  let id = generateRandomString()
  let email = req.body.email
  let password = req.body.password
  users[id] = {
    id: id,
    email: email,
    password: password
  }
  res.cookie("username", id)
  res.redirect("/urls")
})


// --- LOGIN

// creates a cookie when the user enters username
app.post("/login", (req, res) => {
  let username = req.body.username
  res.cookie("username", username)
  res.redirect("/urls")
})

// --- LOGOUT

// deletes user cookie when user logs out
app.post("/logout", (req, res) => {
  let username = req.body.username
  res.clearCookie("username", username)
  res.redirect("/urls")
})

// ---URL LIST

// sets the template for the list of all long & short urls
// exports the database info to the template
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
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
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars)
})

// ---URL ID PAGE

// sets the template for the unique id short URL page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
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