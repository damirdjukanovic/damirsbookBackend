const router = require("express").Router();
const Post = require("../models/Post.js");
const User = require("../models/User.js");


//CREATE A POST
router.post("/", async (req, res) => {
  try {
    const post = await new Post(req.body);
    const newPost = await post.save();
    
    res.status(200).json(newPost);
  } catch (err) {
    res.status(500).json(err);
  }

});

//UPDATE A POST
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(req.body.userId == post.userId) {
      await post.updateOne({$set: req.body});
      res.status(200).json("Post has been updated");
    } else {
      res.status(403).json("You can only update your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE A POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
     await post.deleteOne();
    res.status(200).json("Post deleted")
  } catch (err) {
    res.status(500).json(err);
  }
})

//LIKE / DISLIKE A POST
router.put("/:id/like", async (req, res) => {
  if(!req.body.userId) res.status(403).json("You need to be logged in to do that!");
  try {
    const post = await Post.findById(req.params.id);
    if(!post.likes.includes(req.body.userId)) {
      await post.updateOne({$push: {likes: req.body.userId}});
      res.status(200).json("Post liked");
    } else {
      await post.updateOne({$pull: {likes: req.body.userId}});
      res.status(200).json("Post unliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
})

//GET LIKES OF A POST
router.get("/:id/likes", async (req, res) => {
  console.log("Backend hit");
  try {
    const post = await Post.findById(req.params.id);
    const users = await Promise.all(
      post.likes.map((userId) => {
      return User.find({_id: userId});
    })
  )
  const helper = []
  res.status(200).json(helper.concat(...users));
  } catch (err) {
    res.status(500).json(err)
  }
  
})

//GET A POST
router.get("/:id", async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    res.status(200).json(post)
  } catch (err) {
    res.status(500).json(err)
  }

});

//GET TIMELINE POSTS
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const posts = await Post.find({userId: req.params.userId});
    const friendPosts = await Promise.all(
      currentUser.followings.map((friend) => {
        return Post.find({userId: friend})
      })
    );
    res.status(200).json(posts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
})

//GET USERS ALL POSTS

router.get("/profile/:username", async (req, res) => {
  try {
    const user  = await User.findOne({username: req.params.username}); 

    const posts = await Post.find({userId: user._id});
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err)
  }
});


module.exports = router;