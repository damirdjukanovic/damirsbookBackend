const router = require("express").Router();
const User = require("../models/User.js");
const bcrypt = require("bcrypt");


//UPDATE USER
router.put("/:id", async (req, res) => {
  if(req.body.userId === req.params.id || req.body.isAdmin){
    if(req.body.password){
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt)
        console.log(req.body.password);
      } catch (err) {
        return res.status(500).json(err)
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body
      });
      res.status(200).json(user);
    } catch (err) {
      return res.status(500).json(err); 
    }
  }
  else {
    return res.status(403).json("You can only update your account!")
  }
});

//DELETE USER
router.delete("/:id", async (req, res) => {
  if (req.body.userId == req.params.id || req.body.isAdmin){
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account deleted");
    } catch (err) { 
      return res.status(500).json(err); 
    }
  } else {
    return res.status(403).json("You can only delete your account!")
  }
});


//GET A USER
router.get("/", async (req, res) =>{
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId 
    ? await User.findById(userId) 
    : await User.findOne({username: username});
    const {password, updatedAt, ...other} = user._doc;  
    res.status(200).json(other);
  } catch (err) {
    return res.status(500).json("No user found");
  }   
})

//GET FOLLOWERS
router.get("/followers/:userId", async (req, res) => {
  try {
  const user = await User.findById(req.params.userId);
  const friends = await Promise.all(
    user.followers.map(friendId => {
      return User.findById(friendId);
    })
  )
  if(friends.length === 0) {
    return res.status(200).json([]);
  }
  let friendsList = [];
  friends.map((friend) => {
    const {_id, fullname, username, profilePicture} = friend;
    friendsList.push({_id, fullname, username, profilePicture});
  })
  res.status(200).json(friendsList);
  } catch (err) {
    return res.status(500).json(err)
  }
})

//GET FOLLOWINGS
router.get("/followings/:userId", async (req, res) => {
  try {
  const user = await User.findById(req.params.userId);
  const friends = await Promise.all(
    user.followings.map(friendId => {
      return User.findById(friendId);
    })
  )
  if(friends.length === 0) {
    return res.status(200).json([]);
  }
  let friendsList = [];
  friends.map((friend) => {
    const {_id, fullname, username,profilePicture} = friend;
    friendsList.push({_id, fullname, username, profilePicture});
  })
      res.status(200).json(friendsList);
  } catch(err) {
    return res.status(500).json(err)
  }
})

//FOLLOW A USER
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.body.userId);
      const followedUser = await User.findById(req.params.id);

      if(!user.followings.includes(req.params.id)) {
        await user.updateOne({$push: {followings: req.params.id}});
        await followedUser.updateOne({$push: {followers: req.body.userId}});
        res.status(200).json("User followed");
      } else {
        res.status(403).json("You already follow this user");
      }

    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself")
  }
});

//UNFOLLOW A USER
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.body.userId);
      const followedUser = await User.findById(req.params.id);

      if(user.followings.includes(req.params.id)) {
        await user.updateOne({$pull: {followings: req.params.id}});
        await followedUser.updateOne({$pull: {followers: req.body.userId}});
        res.status(200).json("User unfollowed");
      } else {
        res.status(403).json("You don't follow this user");
      }

    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't unfollow yourself")
  }
});

//SEARCH FILTER
router.get("/search", async (req, res) => {
  try {
    const result = await User.find({search: req.query.query});
    res.status(200).json(result)
  } catch (e) {
    res.status(500).json(e.message);
  }

})

//POST NOTIFICATION
router.post("/notifications/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    await user.updateOne({$push: {
      notifications: req.body
    }})
    res.status(200).json("Successfully posted notification");
  } catch(err) {
    res.status(500).json(err.message);
  }

})

//GET NOTIFICATIONS
router.get("/notifications/:userId", async(req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.status(200).json(user.notifications);
  } catch(err) {
    res.status(500).json(err);
  }

});

//DELETE NOTIFICATION
router.put("/notifications/:userId/delete", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const newNotifications = user.notifications.filter((n) => n.senderId !== req.body.senderId);
    await user.updateOne({$set: {notifications: newNotifications}});
    res.status(200).json("Notification deleted");
  } catch(err) {
    res.status(500).json(err.message);
  }

})


module.exports = router;