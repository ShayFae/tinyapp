const findUserByEmail = function(email, database) {
  for (const userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    }
  }
  return null;
};

const urlsForUser = (user, uDatabase) => {
  let userLinks = {};
  for (const value in uDatabase) {
    if (uDatabase[value].userID === user) {
      userLinks[value] = uDatabase[value].longURL;
    }
  }
  return userLinks;
};

module.exports = { urlsForUser, findUserByEmail };