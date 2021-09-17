const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: "https://mail.crestedcranesolutions.com/wp-content/uploads/2013/07/facebook-profile-picture-no-pic-avatar.jpg"
  },
  username: {
    type: String,
    required: true
  },
  fullname: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  }
},{timestamps: true})


module.exports = mongoose.model("Comment", CommentSchema);