///// HELPERS /////

// Checks email against database to see if it exists. If it does, returns database keys
const getUserByEmail = (database, email) => {
  for (const data in database) {
    if (database[data].email === email) {
      return database[data];
    }
  }
  return false;
};

// Generates random string of 6 alphanumeric characters
function generateRandomString() {
  let result = "";
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < chars.length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.substring(0,6);
}

// Checks user against database to see if they have matching URLs
const urlsForUser = (database, id) => {
  const matchingURLs = {};
  for (const data in database) {
    if (database[data].userID === id) {
      matchingURLs[data] = database[data];
    }
  }
  return matchingURLs;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };