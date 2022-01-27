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
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const findUserByEmail = function(user, email) {
  for (const userid in user){
    if(user[userid].email === email){
      // console.log('this is name', userid)
        return user[userid]
    }
  }
  return null;
};

const findUrl = function(user, data) {
  let find = {}
for(const key in urlDatabase) {
find[key] = urlDatabase[key].longURL;
}
return find;
};

app.listen(PORT, () => {
  console.log(`Tiny App is listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  // console.log(findUrl(urlDatabase))
  const user = req.cookies['user_id']
  const templateVars = { urls: findUrl(user, urlDatabase), userid: users[req.cookies['user_id']] };
  console.log('1', urlDatabase)
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  // urlDatabase[randomString] = req.body.longURL;
  urlDatabase[randomString] ={ longURL: req.body.longURL, userid: req.cookies['user_id'] } 
  console.log('2', urlDatabase)

  res.redirect(`/urls/`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {userid: users[req.cookies['user_id']] };
  console.log('3', urlDatabase)

 if(!templateVars.userid) {
   res.redirect('/login')
 }
  res.render("urls_new", templateVars);
  
});

//need to show longurl in the edit!!!
app.get("/urls/:shortURL", (req, res) => {
  // const userid = req.cookies['user_id']
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log(findUrl('this', urlDatabase))
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, userid: users[req.cookies['user_id']]};
  if(!templateVars.userid) {
    res.status(401).send("Unauthorized access")
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL].longURL;
   res.redirect(longURL);
});
console.log(urlDatabase)

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, userid: users[req.cookies['user_id']] };
  res.render('registration_page', templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: null };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const random = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // let newUser = {id: random, email: email, password: req.body.password};
  //   users[random] = newUser;
  users[random] = { id: random, email: email, password: password };
  //checks for blank submission
  if(!email || !password){
    res.status(400).send('Empty entry');
    }
  //checks user if email is already in use with the function and sends a 400 status
  if (findUserByEmail(users, email)) {
      res.status(400).send('Email already in use');
    }
  res.cookie("user_id", random);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = {  userid: users[req.cookies['user_id']] };
  if(!templateVars.userid) {
    res.status(401).send("Unauthorized access")
  }
  //deletes the chosen param
  delete urlDatabase[req.params.shortURL]; 
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  // console.log('this is new long ',req.body.longURL)
  // console.log('this is short', req.params.shortURL)
  // console.log('This is long', urlDatabase[req.params.shortURL].longURL)
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  console.log(users[req.cookies['user_id']])
  const templateVars = { userid: users[req.cookies['user_id']] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //Email checker
  const user = findUserByEmail(users, email);
  //if user password doesn't match registered password it will return the status 
  if(user.password !== password) {
    return res.status(403).send("Incorrect password");
  };
  //If no email is found matching it would return the status 
  if(!user){
    return res.status(403).send("Email not found");
  };
  res.cookie("user_id", user.id);
  res.redirect("/urls");
}); 

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});