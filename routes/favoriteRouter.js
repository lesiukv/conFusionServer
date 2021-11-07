const express = require("express");
const Favorites = require("../models/favorites.js");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const favoriteRouter = express.Router();
const cors = require("./cors");

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .get(authenticate.verifyUser, async (req, res, next) => {
    try {
      const favorites = await Favorites.find({ user: req.user._id })
        .populate("user")
        .populate("dishes");
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  })
  .delete(authenticate.verifyUser, async (req, res, next) => {
    try {
      await Favorites.deleteMany({ user: req.user._id });
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json("Removed Favorites");
    } catch (error) {
      next(error);
    }
  })
  .post(authenticate.verifyAdmin, async (req, res, next) => {
    try {
      const dishes = req.body;
      const isFavoritesExists = await Favorites.findOne({ user: req.user._id });
      console.log(dishes);
      if (isFavoritesExists?.user.toString() == req.user._id.toString()) {
        Favorites.findOne({ user: req.user._id }).then((favorite) => {
          dishes.forEach((dish) => {
            favorite.dishes.push(dish);
          });
          favorite.save().then((favorite) => {
            favorite
              .populate("dishes")
              .populate("user")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          });
        });
      } else {
        Favorites.create({ user: req.user._id, dishes: dishes }).then(
          (favorite) => {
            favorite
              .populate("dishes")
              .populate("user")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          }
        );
      }
    } catch (error) {
      next(error);
    }
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions)
  .get(cors.cors, authenticate.verifyUser, async (req, res, next) => {
    try {
      Favorites.findOne({ user: req.user._id }).then((favorite) => {
        if (!favorite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          return res.json({ exists: false, favorite: favorite });
        } else {
          if (favorite.dishes.indexOf(req.params.dishId) < 0) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ exists: false, favorite: false });
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ exists: true, favorite: false });
          }
        }
      });
    } catch (error) {
      next(error);
    }
  })
  .post(authenticate.verifyUser, async (req, res, next) => {
    try {
      const { dishId } = req.params;
      const isFavoritesExists = await Favorites.findOne({ user: req.user._id });

      if (isFavoritesExists?.user.toString() == req.user._id.toString()) {
        Favorites.findOne({ user: req.user._id }).then((favorite) => {
          favorite.dishes.push(dishId);
          favorite.save().then(() => {
            Favorites.findById(favorite)
              .populate("user")
              .populate("dishes")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          });
        });
      } else {
        Favorites.create({ user: req.user._id, dishes: [dishId] }).then(
          (favorite) => {
            favorite
              .populate("dishes")
              .populate("user")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          }
        );
      }
    } catch (error) {
      next(error);
    }
  })
  .delete(authenticate.verifyUser, async (req, res, next) => {
    try {
      const { dishId } = req.params;
      Favorites.find({ user: req.user._id }).then((favorite) => {
        const index = favorite.dishes.indexOf(dishId);
        if (index > -1) {
          favorite.dishes.splice(index, 1);
        }
        favorite.save().then((favorite) => {
          favorite
            .populate("dishes")
            .populate("user")
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            });
        });
      });
    } catch (error) {
      next(error);
    }
  });

module.exports = favoriteRouter;
