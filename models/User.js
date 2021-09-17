const mongoose = require("mongoose");
const atlasPlugin = require('mongoose-atlas-search');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVamKPfw0_YElX1zi2NykJl0Ee3zc2wi22fA&usqp=CAU"
  },
  coverPicture: {
    type: String,
    default: "https://image.shutterstock.com/image-photo/looking-white-ceiling-room-old-260nw-1474793303.jpg"
  },
  from: {
    type: String,
    default: ""
  },
  age: {
    type: String,
    default: ""
  },
  relationship: {
    type: String,
    default: ""
  },
  fullname: {
    type: String,
    required: true
  },
  followers: {
    type: Array,
    default: []
  },
  followings: {
    type: Array,
    default: []
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  notifications: {
    type: Array,
    default: []
  }
},
{collection: 'users'},
{timestamps: true}
)



const User = mongoose.model("User", UserSchema);

module.exports = User;

atlasPlugin.initialize({
  model: User,
  overwriteFind: true,
  searchKey: 'search',
  searchFunction: query => {
    return {
      'wildcard': {
        'query': `${query}*`,
        'path': 'fullname',
        'allowAnalyzedField': true
      }
    }
  }

});