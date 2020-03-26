const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../helpers/jsquery')
const bcrypt = require('bcryptjs')

// Change User to catch error
module.exports = function(passport){
    passport.use(
    new LocalStrategy(
    { usernameField: 'username'},(username, password, done) => {
      User.findOneUser({ username: username})
        .then(result =>{
            user = result[0]
            // if User Exists  
            if(!user){
                return done(null, false, { message: 'That is not a Registered User'})
            }
      
            //if user exists, Match password
            bcrypt.compare(password, user.password, (err, isMatch)=>{
                if(isMatch){
                    return done(null, user)
                } else {
                    return done(null, false, { message: 'Incorrect Password'})
                }
            })
        }).catch((err)=> {
          console.log('some error occurred');
          // return done(null, false, { message: 'Internal Server Error, Contact Administrator'})
          return done(error, false)
          // throw new Error(500, 'Internal Error')
        })
    }
  )
);
// passport.serializeUser(function(user, done) {
//     console.log(`serializing is going on`)
//     done(null, user.id);
//   });

  passport.serializeUser(function(user, done) {
    console.log(`serializing is going on`)
    done(null, user);
  });

// passport.deserializeUser(function(id, done) {
//     console.log('deserialization process')
//     User.findOneUser({ id: id}, function(err, user){
//         done(err, user);
//     })
//   });
// }

// Null should be an error rather
// passport.deserializeUser(function(id, done) {
//     console.log('deserialization process')
//     User.findOneUser({ id: id }).then(result => {
//         console.log(result[0]);
//         done(null, result[0]);
//     })
//   });
// }

passport.deserializeUser(function(user, done) {
  console.log('deserialization process')
  done(null, user)
});
}