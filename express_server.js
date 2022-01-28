const express = require("express");
const app = express();
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
var cookieSession = require('cookie-session')
// const salt = bcrypt.genSaltSync(10);
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['QeShVmYq3t6w9z$C', 'KbPeSgVkYp3s6v9', 'D*G-KaPdSgUkXp2s', '!z%C*F-JaNdRgUjX', 't6w9z$C&F)J@NcRf'],
  maxAge: 24 * 60 * 60 * 1000 
}))
// app.use(cookieParser());

const generateRandomString = function() {
  //Num to string then return from 2 the length of 6(no decimal!)
  return Math.random().toString(36).substr(2, 6);
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password:  bcrypt.hashSync("purple-monkey-dinosaur")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user3@example.com",
    password: "test"
  }
};

const findUserByEmail = function(email) {
  for (const userid in users) {
    if (users[userid].email === email) {
      // console.log('this is name', userid)
      return users[userid];
    }
  }
  return null;
};

const findUrl = function(user, data) {
  let url = {};
  for (const key in urlDatabase) {
    url[key] = urlDatabase[key].longURL;
  }
  return url;
};

// const urlsForUser = function(id, user) {
//   let userLinks = {};
//   for (const test in id) {
//     id[test].userID;
//     if (user === id[test].userID) {
//       // console.log('yes')
//       // console.log(id[test].longURL)
//       userLinks[test] = id[test].longURL;
//       return userLinks;
//     }
//   }
//   // console.log(userLinks)
//   return false;
// };

// const user = "aJ48lW"
const urlsForUser = (user, uDatabase) => {
  let userLinks = {};
  for (const value in uDatabase) {
    if (uDatabase[value].userID === user) {
      userLinks[value] = uDatabase[value].longURL;
    }
  }
  return userLinks;
};

app.listen(PORT, () => {
  console.log(`Tiny App is listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  // console.log(findUrl(urlDatabase))
  const user = req.session['user_id']
    if (!user) {
    return res.redirect('/login');
  }
  const templateVars = { urls: findUrl(user, urlDatabase), userid: users[req.session['user_id']] };
  res.render('urls_index', templateVars);
});

//Can't update new URLS
// app.get("/urls", (req, res) => {
//   const user = req.cookies['user_id'];
//   if (!user) {
//     return res.redirect('/login');
//   }
//       // const templateVars = { urls: urlsForUser(user, urlDatabase), userid: users[req.cookies['user_id']] };
//       // res.render('urls_index', templateVars);
//  const templateVars = { urls: findUrl(user, urlDatabase), userid: users[req.cookies['user_id']] };
//  res.render('urls_index', templateVars);
// });

app.post("/urls", (req, res) => {
  // console.log(req.body); 
  const randomString = generateRandomString();
  urlDatabase[randomString] = { longURL: req.body.longURL, userid: users[req.session['user_id']] };
  console.log('test', urlDatabase[randomString].longURL)
  res.redirect('/urls');
});



app.get("/urls/new", (req, res) => {
    // res.send('hello')
  const templateVars = {userid: users[req.session['user_id']] };
  if (!templateVars.userid) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
  
});

app.get("/urls/:shortURL", (req, res) => {
  // res.send('hello')
  // const user = req.cookies['user_id']
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log(findUrl('this', urlDatabase))
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, userid: users[req.session['user_id']]};
  if (!templateVars.userid) {
    res.status(401).send("Unauthorized access");
  }
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


app.post("/register", (req, res) => {
  const random = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10)
  // let newUser = {id: random, email: email, password: req.body.password};
  //   users[random] = newUser;
  users[random] = { id: random, email: email, password: password };
  //checks for blank submission
  if (!email ||  !password) {
    res.status(400).send('Empty entry');
  }
  //checks user if email is already in use with the function and sends a 400 status
  if (findUserByEmail(users, email)) {
    res.status(400).send('Email already in use');
  }
  req.session['user_id'] = random;
  // res.cookie("user_id", random);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = {  userid: users[req.session['user_id']] };
  if (!templateVars.userid) {
    res.status(401).send("Unauthorized access");
  }
  //deletes the chosen param
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  // console.log('this is new long ',req.body.longURL)
  // console.log('this is short', req.params.shortURL)
  // console.log('This is long', urlDatabase[req.params.shortURL].longURL)
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  // console.log(users[req.cookies['user_id']]);
  const templateVars = { userid: users[req.session['user_id']] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10)
  // console.log(hashPassword)
  //Email checker
  const user = findUserByEmail(email);
  console.log(user)
  //if user password doesn't match registered password it will return the status
  if (user.password !== password) {
    return res.status(403).send("Incorrect password");
  }
  //If no email is found matching it would return the status
  if (!user) {
    return res.status(403).send("Email not found");
  }
  // res.cookie("user_id", user.id);
  req.session['user_id'] = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // res.clearCookie('user_id');
  req.session['user_id'] = null;
  res.redirect("/urls");
});