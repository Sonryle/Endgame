if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  console.log("using .env file")
}

const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')
const flash = require('express-flash')

const app = express()
const port = 5137;
const users = [];

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id),
)

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/login/login.html')
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  // failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/register/register.html');
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users);
})

app.get('/', checkAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/homepage/homepage.html')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}

app.listen(port, () => {console.log(`Endgame listening on port ${port}`) });
