const router = require("express").Router();
const User = require("../models/User"); 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth = require("../middlewares.js");

//REGISTER
router.post("/register", async (req, res) => {

  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const existingUser = await User.findOne({username: req.body.username});

    if(existingUser){
      return res.status(400).json({msg: "This username is already taken"})
    }
    const existingEmail = await User.findOne({email: req.body.email});
    
    if(existingEmail){
      return res.status(400).json({msg: "This email is already taken"})
    }

    const user = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      fullname: req.body.fullname
    })

    user.save()
      .then(user => {
        jwt.sign({
          id: user._id
          }, 
          process.env.ACCESS_TOKEN, 
          {expiresIn: 10000}, 
          (err, token) => {
            if (err) throw err;
            res.status(200).json({token, user: {
              _id: user._id,
              username: user.username,
              fullname: user.fullname,
              followings: user.followings,
              followers: user.followers,
              followings: user.followings,
              from: user.from,
              relationship: user.relationship,
              profilePicture: user.profilePicture,
              coverPicture: user.coverPicture,
              isAdmin: user.isAdmin,
              notifications: user.notifications
            }});
          })
      }).catch(() => res.json({msg: "token signature error"}));

  } catch(err) {
    console.log(err);
    res.status(500);
  }
  
})

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({username: req.body.username});
    if (!user) {
      return res.status(400).json({msg: "Incorrect credentials"})
    }

    const passwordIsValid = await bcrypt.compare(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(400).json({msg: "Incorrect credentials"})
    }
    const token = await jwt.sign({id: user._id}, process.env.ACCESS_TOKEN);
    res.status(200).json({
      token, 
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        followers: user.followers,
        followings: user.followings,
        from: user.from,
        relationship: user.relationship,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        isAdmin: user.isAdmin,
        notifications: user.notifications
        }
      })
  } catch(err) {
    res.status(400).json({msg: "Something went wrong"});
  }
  
});

router.get("/getUser", auth, (req,res) => {
  User.findById(req.user.id)
      .select('-password')
      .then(user => res.json(user));
});

module.exports = router;

