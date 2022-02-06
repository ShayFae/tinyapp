//Looks for matching emails in the database
const findUserByEmail = function(email, database) {
  for (const userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    }
  }
  return null;
};

//Grabs shortlink and URL for user
const urlsForUser = (user, uDatabase) => {
  let userLinks = {};
  for (const value in uDatabase) {
    if (uDatabase[value].userID === user) {
      userLinks[value] = uDatabase[value].longURL;
    }
  }
  return userLinks;
};

//Makes a random userID 
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 6);
};

module.exports = { urlsForUser, findUserByEmail, generateRandomString };