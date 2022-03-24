const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const bcrypt = require("bcryptjs")


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs")

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

const urlsForUser = (id) => {
  const matchingURLs = {};
  for (const data in urlDatabase) {
    if (urlDatabase[data].userID === id) {
      matchingURLs[data] = urlDatabase[data];
    }
  }
  return matchingURLs;
}

const users = {}

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
  if(!req.cookies["user_id"]) {
    return res.send("Error: Cannot post without logging in.")
  }
  let randomKey = generateRandomString();
  urlDatabase[randomKey] = { longURL: req.body.longURL, userID: req.cookies.user_id }
  res.redirect(`/urls/${randomKey}`);
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  res.redirect(`/urls/${shortURL}`)
})

app.post("/urls/:id", (req, res) => {
  let user = req.cookies["user_id"]
  if (!user) {
    res.status(403)
    return res.send("Unauthorized access")
  }
  const shortURL = req.params.id
  res.redirect(`/urls/${shortURL}`)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  let user = req.cookies["user_id"]
  if (!user) {
    res.status(403)
    return res.send("Unauthorized access")
  }
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password
  const user = checkForRegisteredEmail(users, email)
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403);
    return res.send("403: User email or password is incorrect.")
  }

  res.cookie("user_id", user.id)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", { path: "/" });
  res.redirect("/urls")
})

app.post("/register", (req, res) => {
  // creates new user object and adds it to users database
  const randomString = generateRandomString()
  const newUser = {}
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  newUser.id = randomString;
  newUser.email = req.body.email;
  newUser.password = hashedPassword;
  
  
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
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404)
    return res.send("404: Page not found.")
  }
  const longURL = urlDatabase[req.params.shortURL]
  if (longURL) {
    res.redirect(longURL.longURL);
  }  
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
  urls: urlsForUser(req.cookies["user_id"]),
  user: users[req.cookies["user_id"]]
  }
 
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
  user: users[req.cookies["user_id"]]
  }
  if (!templateVars.user) {
    return res.redirect("/login")
  }
  res.render("urls_new", templateVars)
})

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404)
    return res.send("404: Page not found.")
  } else if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    res.status(404)
    return res.send("404: Access Denied")//
  } else {
    const templateVars = { 
      shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.cookies["user_id"]]
    }
    res.render("urls_show", templateVars)
  }
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