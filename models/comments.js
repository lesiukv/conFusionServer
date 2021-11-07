const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
    },
  },
  {
    usePushEach: true,
    timestamps: true,
  }
);

const Comments = mongoose.model("Comment", commentSchema);

module.exports = Comments;
