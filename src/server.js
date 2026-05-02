if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  console.log("using .env file")
}

// General
const express = require('express')
const app = express()
const port = 5137
app.use(express.urlencoded({ extended: false }))

// Postgres communication
const initializePostgres = require('./postgres-setup')
const db = initializePostgres()

// User sessions & login
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')
const initializePassport = require('./passport-setup')
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
initializePassport( passport, async (email) => {
    let result;
    await db.one('SELECT * FROM endgame_users WHERE email = $1', [ email ]).then((data) => {
            result = data
        }).catch((err) => {
            console.log('POSTGRES ERROR: ', err)
            result = null
        })
    return result;
}, async (id) => {
    let result;
    await db.one('SELECT * FROM endgame_users WHERE id = $1', [ id ] ).then((data) => {
            result = data
        }).catch((err) => {
            console.log('POSTGRES ERROR: ', err)
            result = err
        })
})

// Get/Post stuffs
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    .sendFile(__dirname + '/loginpage/login.html')
})

app.post('/login', checkNotAuthenticated, (req, res) => {
    passport.authenticate('local', {
      successRedirect: '/homepage',
      failureRedirect: '/login',
    })(req, res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private'))
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    .sendFile(__dirname + '/registerpage/register.html')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10)
  const query = " INSERT INTO endgame_users (name, mojang_username, password, email) VALUES ($1, $2, $3, $4);"
  db.none(query, [ req.body.name, 'alex', hashedPassword, req.body.email ]).catch((error) => {
          console.log('ERROR: ', error);
      })
  res.redirect('/login')
})

app.get('/homepage', checkAuthenticated, (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    .sendFile(__dirname + '/homepage/homepage.html')
})

app.get('/', checkAuthenticated, (req, res) => {
  res.redirect('/homepage')
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
