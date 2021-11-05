var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/users.js");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken");
var facebookTokenStrategy = require("passport-facebook-token");
var config = require("./config");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

passport.use(
  "user-rule",
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

passport.use(
  "admin-rule",
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user.admin) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

const facebookOpts = {
  clientId: config.facebook.clientId,
  clientSecret: config.facebook.clientSecret,
};

exports.verifyUser = passport.authenticate("user-rule", { session: false });
exports.verifyAdmin = passport.authenticate("admin-rule", { session: false });

exports.facebookPassport = passport.use(
  new facebookTokenStrategy(
    facebookOpts,
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (!err && user !== null) {
          return done(null, user);
        } else {
          user = new User({ username: profile.displayName });
          user.facebookId = profile.id;
          user.firstname = profile.name.givenName;
          user.lastname = profile.name.fammilyName;
          user.save((err, user) => {
            if (err) {
              return done(err, false);
            } else return done(null, user);
          });
        }
      });
    }
  )
);
