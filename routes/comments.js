const router = require("express").Router();
const Comment = require("../models/Comment.js");
const User = require("../models/User.js");
const Post = require("../models/Post.js");



//ADD A COMMENT

router.post("/", async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    const post = await Post.findById(req.body.postId);

    const comment = await new Comment(req.body);
    await comment.save();
    await post.updateOne({$push: {comments: comment}})
    res.status(200).json("comment added");
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE A COMMENT
router.put("/delete/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    const post = await Post.findById(comment.postId);

    if(comment.userId === req.body.userId) {
      await comment.deleteOne();
      await post.updateOne({$pull: {comments: comment}});
      res.status(200).json("Comment deleted");
    } else {
      res.status(403).json("You can only delete your account")
    }
  } catch (err) {
    res.status(500).json(err.message);
    console.log(err.message);
  }
})

//GET COMMENTS FOR A POST
router.get("/:id", async (req, res) => {
  try {
  const post = await Post.findById(req.params.id);
  const comments = post.comments.map(comment => comment);
  res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
