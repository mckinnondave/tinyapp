// -- Global Constants --
const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers")

app.set("view engine", "ejs")

// -- Middleware --
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["Brassneck", "Faculty", "Mainstreet"],
  maxAge: 24 * 60 * 60 * 1000 
}))

// -- Databases --
const users = {}

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

// -- Routes --
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  if(!req.session.user_id) {
    return res.send("Error: Cannot post without logging in.")
  }
  let randomKey = generateRandomString();
  urlDatabase[randomKey] = { longURL: req.body.longURL, userID: req.session.user_id }
  res.redirect(`/urls/${randomKey}`);
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`)
})

app.post("/urls/:id", (req, res) => {
  let user = req.session.user_id;
  if (!user) {
    res.status(403)
    return res.send("Unauthorized access")
  }
  const shortURL = req.params.id
  res.redirect(`/urls/${shortURL}`)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  let user = req.session.user_id;
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
  const user = getUserByEmail(users, email)
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403);
    return res.send("403: User email or password is incorrect.")
  }

  req.session.user_id = user.id
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls")
})

app.post("/register", (req, res) => {
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

  if (getUserByEmail(users, newUser.email)) {
    res.status(400);
    return res.send("400: Email is already being used.")
  }
  
  users[newUser.id] = newUser
  req.session.user_id = newUser.id
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

app.get("/urls", (req, res) => {
  const templateVars = { 
  urls: urlsForUser(urlDatabase, req.session.user_id),
  user: users[req.session.user_id]
  }
 
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
  user: users[req.session.user_id]
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
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(404)
    return res.send("404: Access Denied")//
  } else {
    const templateVars = { 
      shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    }
    res.render("urls_show", templateVars)
  }
})

app.get("/register", (req, res) => {
  const templateVars = {
  user: users[req.session.user_id]
  }
  res.render("register", templateVars)
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
    }
    res.render("login", templateVars)
})

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
})



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});