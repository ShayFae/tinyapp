const express = require("express");
const app = express();
var cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())

const generateRandomString = function() {
  //Num to string then return from 2 the length of 6(no decimal!)
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.listen(PORT, () => {
  console.log(`Tiny App is listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], newUser: req.cookies['user_id'], email: req.cookies['email'] };
  // console.log(req.cookies['user_id'])
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  // console.log(req.cookies['user_id'])
  res.redirect(`/urls/${randomString}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"], newUser: req.cookies['user_id'], email: req.cookies['email'] };
  // console.log(users[req.cookies['user_id']])
  res.render("urls_new", templateVars);
  
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"], newUser: req.cookies['user_id'], email: req.cookies['email']  };
  // console.log(req.cookies['user_id'])
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL];
   res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], newUser: req.cookies['user_id'], email: req.cookies['email'] };
  // console.log(req.cookies['user_id'])
  res.render('registration_page', templateVars);
});

app.post("/register", (req, res) => {
  let random = generateRandomString();
  let email = req.body.email
  let newUser = {id: random, email: email, password: req.body.password}
  users[random] = newUser;
 
  res.cookie('email', newUser.email)
  res.cookie('user_id', random);
  if(!newUser.email || !newUser.password) {
    return res.status(400);
  }

  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL] 
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {

  // const email = req.body.email;
  // const password = req.body.password;
  res.cookie('username', req.body.username) 
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls")
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], newUser: req.cookies['user_id'], email: req.cookies['email'] };

  res.render("login", templateVars)
})