const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, cb) => {
    const user = getUserByEmail(email)
    if (user == null) {
      console.log("user doesnt exist")
      return cb( null, false, { message: 'No user with that email' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        console.log("user logging in: " + user.name)
        return cb( null, user)
      } else {
        console.log("password incorrect")
        return cb( null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return cb(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => {done(null, user.id)})
  passport.deserializeUser((id, done) => {return done(null, getUserById(id))})
}

module.exports = initialize;
