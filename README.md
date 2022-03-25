# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of Login page"](https://github.com/mckinnondave/tinyapp/blob/master/docs/login.png?raw=true)
!["Screenshot of URLs page"](https://github.com/mckinnondave/tinyapp/blob/master/docs/urls.png?raw=true)
!["Screenshot of New Short URL page"](https://github.com/mckinnondave/tinyapp/blob/master/docs/newURL.png?raw=true)

## Project Features

- User registration and login
- Saving creation of shortened URLs into database
- Ability to edit, delete, and update shortened URLs
- Use of bcrypt to hash and store passwords
- Creation of encrypted cookies through cookie-session

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- body-parser
- cookie-session

## Dev Dependencies

- Mocha
- Chai
- Nodemon

## File Explanation

### express_server.js
- location for:
  - Global constants
  - Middleware
  - Databases
  - Routes

### helpers.js
- functions used in express_server.js

### test
- testing of a helper function using mocha and chai

### views
- where ejs templates are stored

### partials
- contains file for header banner

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.