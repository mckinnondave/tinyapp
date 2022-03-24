///// GLOBAL CONSTANTS /////
const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");

app.set("view engine", "ejs");

///// MIDDLEWARE /////
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["Brassneck", "Faculty", "Mainstreet"],
  maxAge: 24 * 60 * 60 * 1000
}));

///// DATABASES /////
const users = {};
const urlDatabase = {};

///// ROUTES /////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  const user = req.session.user_id;
  if(!user) {
    res.redirect("/login");
  }
  res.redirect("/urls");
})

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Error: Cannot post without logging in.");
    return;
  }
  let id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  let user = req.session.user_id;

  if (!user) {
    res.status(400).send("Error: Unauthorized access");
    return;
  }

  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let user = req.session.user_id;

  if (!user) {
    res.status(400).send("Error: Unauthorized access");
    return;
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(users, email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(400).send("Error: User email or password is incorrect.");
    return;
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const newUser = {};
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  newUser.id = id;
  newUser.email = req.body.email;
  newUser.password = hashedPassword;
  
  if (newUser.email === "" || newUser.password === "") {
    res.status(400).send("Error: Email or password fields were not filled in.");
    return;
  }

  if (getUserByEmail(users, newUser.email)) {
    res.status(400).send("Error: Email is already being used.");
    return;
  }
  
  users[newUser.id] = newUser;
  req.session.user_id = newUser.id;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("Error: Page not found.");
    return;
  }
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL.longURL);
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(urlDatabase, req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send("Error: Page not found.");
    return;
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(400).send("Error: Access Denied");
    return;
  } else {
    const templateVars = {
      shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

///// LISTENING /////
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
});
