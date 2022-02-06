const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { findUserByEmail } = require('./helpers');
const { urlsForUser } = require('./helpers');
const { generateRandomString } = require('./helpers'); 
const PORT = 8080; 
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['QeShVmYq3t6w9z$C', 'KbPeSgVkYp3s6v9', 'D*G-KaPdSgUkXp2s', '!z%C*F-JaNdRgUjX', 't6w9z$C&F)J@NcRf'],
  maxAge: 24 * 60 * 60 * 1000
}));

//Holds user data
const urlDatabase = {};
const users = {};

//GET
app.get("/", (req, res) => {
  res.redirect('/urls')
});

app.get("/urls", (req, res) => {
  //First checks if there's a user logged in, if not it redirect them to login
  const user = req.session['user_id'];
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = { urls: urlsForUser(user, urlDatabase), userid: users[req.session['user_id']] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  //Checks if there's a user if not it redirects them to login 
  const templateVars = {userid: users[req.session['user_id']] };
  if (!templateVars.userid) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  //If the userID doesn't match the shortURL userID then that user cannot edit that shortURL
  //If they are the matching userID then they can edit the URL on the edit page
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const user = req.session['user_id'];
  const shortURLUser = urlDatabase[req.params.shortURL].userID;
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, userid: users[req.session['user_id']]};
  if (user !== shortURLUser) {
    res.status(401).send("Unauthorized access");
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, userid: users[req.session['user_id']] };
  res.render('registration_page', templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { userid: users[req.session['user_id']] };
  res.render("login_page", templateVars);
});

//POST
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = { longURL: req.body.longURL, userID: req.session['user_id'] };
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //Delete's URL but only if the userID matches the userID who made the URL
  //If not then it sends a 401 status
  const user = req.session['user_id'];
  const shortURLUser = urlDatabase[req.params.shortURL].userID;
    if (shortURLUser === user) {
      delete urlDatabase[req.params.shortURL], req.params.shortURL;
      res.redirect("/urls");
    } else {
      res.status(401).send("Unauthorized access");
    }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  //Edit section where you change the longURL
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  //Checks if the users email is in the database before registering the user into it 
  //Also if the password/email section is empty or not
  const email = req.body.email;
  if (findUserByEmail(email, users)) {
    res.status(400).send('Email already in use');
  }
  const random = generateRandomString();
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10);
  const user = urlDatabase;
  users[random] = { id: random, email: email, password: password };
  if (!email ||  !password) {
    res.status(400).send('Empty entry');
  }
  req.session['user_id'] = random;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  //Checks if the password is correct and if the email is in the database if not it redirects
  const email = req.body.email;
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10);
  const user = findUserByEmail(email, users);
  if (user.password !== password) {
    return res.status(403).send("Incorrect password");
  }
  if (!user) {
    return res.status(403).send("Email not found");
  }
  req.session['user_id'] = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //Removes cookies and returns to /urls path page
  req.session['user_id'] = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny App is listening on port ${PORT}!`);
});