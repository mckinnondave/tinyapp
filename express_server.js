const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "1@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "2@example.com", 
    password: "456"
  }
}

function generateRandomString() {
  let result = ""
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  for (let i = 0; i < chars.length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));   
  }
  return result.substring(0,6)
}

const checkForRegisteredEmail = (database, email) => {
  for (const data in database) {
    if (database[data]["email"] === email) {
      return database[data];
    }
  }
  return false
}

const checkForRegisteredPassword = (database, password) => {
  for (const data in database) {
    if (database[data]["password"] === password) {
      return database[data];
    }
  }
  return false
}

app.post("/urls", (req, res) => {
  let randomKey = generateRandomString();
  urlDatabase[randomKey] = req.body.longURL
  res.redirect(`/urls/${randomKey}`);
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
})

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  res.redirect(`/urls/${shortURL}`)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password

  if (!checkForRegisteredEmail(users, email)) {
    res.status(403);
    return res.send("403: User email cannot be found.")
  }

  const userInfo = checkForRegisteredPassword(users, password)

  if (!userInfo) {
    res.status(403);
    return res.send("403: User password is incorrect.")
  }

  res.cookie("user_id", userInfo.id)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", { path: "/" });
  res.redirect("/urls")
})

app.post("/register", (req, res) => {
  // creates new user object and adds it to users database
  let randomString = generateRandomString()
  let newUser = {}
  newUser.id = randomString;
  newUser.email = req.body.email;
  newUser.password = req.body.password;
  
  if (newUser.email === "" || newUser.password === "") {
    res.status(400);
    return res.send("400: Email or password fields were not filled in.")
  }

  if (checkForRegisteredEmail(users, newUser.email)) {
    res.status(400);
    return res.send("400: Email is already being used.")
  }
  
  users[newUser.id] = newUser
  res.cookie("user_id", newUser.id)
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  // console.log(req.cookies["user_id"]);
  const templateVars = { 
  urls: urlDatabase, 
  user: users[req.cookies["user_id"]]
  }
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
  user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars)
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], 
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_show", templateVars)
})

app.get("/register", (req, res) => {
  const templateVars = {
  user: users[req.cookies["user_id"]]
  }
  res.render("register", templateVars)
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
    }
    res.render("login", templateVars)
})

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});