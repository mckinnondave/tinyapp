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
    email: "user@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
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

app.post("/urls", (req, res) => {
  let randomKey = generateRandomString();
  urlDatabase[randomKey] = req.body.longURL
  res.redirect(`/urls/${randomKey}`);
  console.log(`TinyURL created for ${req.body.longURL}`);
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
  let username = req.body.username;
  res.cookie("username", username)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("username", { path: "/" });
  res.redirect("/urls")
})

app.post("/register", (req, res) => {
  let randomString = generateRandomString()
  let newUser = {}
  newUser.id = randomString;
  newUser.email = req.body.email;
  newUser.password = req.body.password;
  users[newUser.id] = newUser 
  res.cookie("user_id", users[newUser.id])
  console.log("users", users);
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
  const templateVars = { 
  urls: urlDatabase, 
  user: req.cookies["user_id"]
  }
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
  user: req.cookies["user_id"]
  }
  res.render("urls_new", templateVars)
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], 
    // username: req.cookies["username"] };
    user: req.cookies["user_id"]
  }
  res.render("urls_show", templateVars)
})

app.get("/register", (req, res) => {
  const templateVars = {
  user: req.cookies["user_id"]
  }
  res.render("register", templateVars)
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