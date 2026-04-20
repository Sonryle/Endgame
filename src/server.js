if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  console.log("using .env file")
}

const express = require('express')

// User sessions & login
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')

// Postgres communication
const { Pool } = require('pg')
const pgRouter = express.Router()

// Other
const app = express()
const port = 5137
const users = []

// User sessions & login
const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id),
)
app.use(express.urlencoded({ extended: false }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// Postgres communication
app.use('/pg', pgRouter)
const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  ssl: false,
})

// Get/Post stuffs
app.get('/login', checkNotAuthenticated, async (req, res) => {
  try {
    const query = "SELECT * FROM endgame_users"
    const { rows } = await pool.query(query)
    console.log(rows)
  } catch (err) {
    console.error(err)
  }

  res.sendFile(__dirname + '/login/login.html')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  // failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/register/register.html')
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
