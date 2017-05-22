/*  
 *  Name: User.js
 *  Function: store mongoose Model of our User schema and prepare functions
 *            to handle our user data management
 */

// Import libraries
const mongoose   = require('mongoose');
const frArrayAdd = require('../libs/friendlist-array.js');

// Define User
const Friend = function (mongoose) {
  return {
    // Creates mongoose Model from specified Schema
    init: function () {
      this.Schema = new mongoose.Schema({
        _id: Number,
        friendlist: Array
      });

      this.Model = mongoose.model('Friend', this.Schema);
    },

    /*  
     *  Function: adds new user to our DB
     *  Params: data (object) - has to suit User schema:
     *                        { _id: x, friendlist: [] }
     *                        _id (int) - new user ID
     *                        friendlist (array) - not empty user friendlist
     */
    add: function (data, callback) {
      const user     = new this.Model(data);
      const response = { result: false };

      // Try to save created user in DB
      user.save((err) => {
        if(!err){
          response.result = true;
          response.user = user;
        }else{
          response.err = err;
        }

        if(callback){
          callback(response);
        }
      });
    },

    /*  
     *  Function: add friendship between 2 users
     *  Params: uid1 (int) - ID of first user
     *          uid2 (int) - ID of second user
     */
    addFriendship: function (uid1, uid2, callback) {
      const response = { result: false };

      // User "uid1": add friend "uid2"
      this.addFriend(uid1, uid2, (r) => {
        if(!r.result){
          response.err = r.err;
          return callback(response);
        }

        // User "uid2": add friend "uid1"
        this.addFriend(uid2, uid1, (r) => {
          if(!r.result){
            response.err = r.err;
          }else{
            response.result = true;
          }

          return callback(response);
        });
      });
    },

    /*  
     *  Function: adds "friendId" to user "uid" friendlist
     *  Params: uid (int) - ID of user
     *          friendID (int) - ID of the friend we try to add
     */
    addFriend: function (uid, friendId, callback) {
      const response = { result: false };

      // Try to find user with id equal to "uid" param
      this.findById(uid, (r) => {
        if(!r.result){
          response.err = r.err;
          return callback(response);
        }

        if(r.user !== null){
          // Get friendlist array with new friend
          const newFriendlist = frArrayAdd.addToArray(friendId, r.user.friendlist);

          // Update user friendlist
          this.Model.update({ _id: r.user._id }, { friendlist: newFriendlist}, (err) => {
            if(err){
              response.err = err;
            }else{
              response.result = true;
            }

            return callback(response);
          });
        }else{
          // Add new user to DB with new friend: 1-element friendlist array
          this.add({ _id: uid, friendlist: [friendId] }, (r) => {
            if(!r.result){
              response.err = r.err;
            }else{
              response.result = true;
            }

            return callback(response);
          });
        }
      });
    },

    /*  
     *  Function: delete friendship between 2 users
     *  Params: uid1 (int) - ID of first user
     *          uid2 (int) - ID of second user
     */
    deleteFriendship: function (uid1, uid2, callback) {
      const response = { result: false };

      // User "uid1": remove friend "uid2"
      this.removeFriend(uid1, uid2, (r) => {
        if(!r.result){
          response.err = r.err;
          return callback(response);
        }

        // User "uid2": remove friend "uid1"
        this.removeFriend(uid2, uid1, (r) => {
          if(!r.result){
            response.err = r.err;
          }else{
            response.result = true;
          }

          return callback(response);
        });
      });
    },

    /*  
     *  Function: removes "friendId" from user "uid" friendlist
     *  Params: uid (int) - ID of user
     *          friendID (int) - ID of the friend we try to remove
     */
    removeFriend: function (uid, friendId, callback) {
      const response = { result: false };

      // Try to find user with id equal to "uid" param
      this.findById(uid, (r) => {
        if(!r.result){
          response.err = r.err;
          return callback(response);
        }

        // If user doesn't exist - result true
        if(r.user === null){
          response.result = true;
          return callback(response);
        }

        // Get friendlist array without the friend being removed
        const newFriendlist = frArrayAdd.removeFromArray(friendId, r.user.friendlist);

        // If new friendlist is empty
        if(newFriendlist.length === 0){
          // Remove user from database (0 friends)
          this.Model.remove({ _id: r.user._id }, (err) => {
            if(err){
              response.err = err;
            }else{
              response.result = true;
            }

            return callback(response);
          });
        }else{
          // Update user friendlist
          this.Model.update({ _id: r.user._id }, { friendlist: newFriendlist}, (err) => {
            if(err){
              response.err = err;
            }else{
              response.result = true;
            }

            return callback(response);
          });
        }
      });
    },

    /*  
     *  Function: finds user by ID in DB
     *  Params: userId (int) - ID of desired user
     */
    findById: function (userId, callback) {
      const response = { result: false };

      // Find user in DB
      this.Model.findOne( {_id: userId}, (err, result) => {
        if(!err){
          response.result = true;
          response.user = result;
        }else{
          response.err = err;
        }

        if(callback){
          callback(response);
        }
      });
    }
  }
}

// Create model of User
var frnd = new Friend(mongoose);
frnd.init();

// Export created model
module.exports = frnd;
