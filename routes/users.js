const express = require("express");
const router = express.Router();
const passport = require("passport");
const authenticate = require("../authenticate.js");
const bodyParser = require("body-parser");
const User = require("../models/users");
const cors = require("./cors");

/* GET users listing. */
router.options("*", cors.corsWithOptions, (req, res, next) => {
  res.sendStatus(200);
});

router
  .route("/")
  .get(
    cors.corsWithOptions,
    authenticate.verifyAdmin,
    async (req, res, next) => {
      try {
        const users = await User.find();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(users);
      } catch (error) {
        next(error);
      }
    }
  );

router.post("/signup", cors.corsWithOptions, (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ status: "Registration Successful!", success: true });
          });
        });
      }
    }
  );
});

router.post(
  "/login",
  cors.corsWithOptions,

  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.json({ status: "Login unsuccessfull", success: false, err: info });
      }
      req.login(user, (err) => {
        if (err) {
          res.statusCode = 401;
          res.setHeader("Content-Type", "application/json");
          res.json({
            status: "Login unsuccessfull",
            success: false,
            err: "Cant login user",
          });
        }
        var token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ token: token, status: "Logged In", success: true });
      });
    })(req, res, next);
  }
);

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

router.get("/checkJWTToken", cors.corsWithOptions, (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT invalid", success: false, error: info });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT valid", success: true, user: user });
    }
  })(req, res, next);
});

// routet.get(
//   "/facebook/token",
//   passport.authenticate("facebook-token"),
//   (req, res, next) => {
//     if (req.user) {
//       var token = authenticate.getToken({ _id: req.user._id });
//       res.statusCode = 200;
//       res.setHeader("Content-Type", "application/json");
//       res.json({ success: true, token: token, status: "logged in" });
//     }
//   }
// );

module.exports = router;
