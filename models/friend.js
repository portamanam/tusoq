/*  
 *  Name: User.js
 *  Function: store mongoose Model of our User schema and prepare functions
 *            to handle our user data management
 */

// Import libraries
const mongoose   = require('mongoose');
const frArrayAdd = require('../libs/friendlist-array.js');
var mongoSchema =   mongoose.Schema;
// Define User
const Friend = function (mongoose) {
  return {
    // Creates mongoose Model from specified Schema
    init: function () {
      this.Schema = new mongoose.Schema({
        _id: mongoSchema.Types.ObjectId,
        username : String,
        friendlist: [{
          "friendid" : String,
          "friendusername" : String
        }]
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
    addFriendship: function (uid1, uid2, username1, username2, callback) {
      const response = { result: false };

      // User "uid1": add friend "uid2"
      this.addFriend(uid1, uid2, username1, username2,(r) => {
        if(!r.result){
          response.err = r.err;
          return callback(response);
        }

        // User "uid2": add friend "uid1"
        this.addFriend(uid2, uid1, username2, username1, (r) => {
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
    addFriend: function (uid, friendId, username, friendname, callback) {
      const response = { result: false };

      // Try to find user with id equal to "uid" param
      this.findById(uid, (r) => {
        if(!r.result){
          response.err = r.err;
          return callback(response);
        }

        if(r.user !== null){
          // Get friendlist array with new friend
          console.log("User already exists int Database......");
          console.log("Array Contents Before ---> " + r.user.friendlist);
          var newFriendlist = frArrayAdd.addToArray(friendId, friendname, r.user.friendlist);

          console.log("The friend array size is " + newFriendlist.length);
          console.log("Array Contents After ---> " + newFriendlist);

          // Update user friendlist
          console.log("addFriend userid BEFORE UPDATE --> " + r.user._id );
          console.log("addFriend username BEFORE UPDATE --> " + username );
           console.log("addFriend newFriendlist[1] --> " + newFriendlist[1] );

           this.Model.findOne({ '_id': r.user._id}, function (err, user) {
                 console.log("FOUND USER : " + JSON.stringify(user));
                 user.friendlist = newFriendlist;


                  user.save(function (err) {
                      if(err) 
                      {
                         response.err = err;
                          console.error('ERROR!');
                      }
                      else
                      {
                            response.result = true;
                      } 

                     return callback(response);             
                  });   
              });

          /*this.Model.findOneAndUpdate({ '_id': r.user._id }, { 'username': username }, {$set: {'friendlist.0.friendid': '23'}}, (err) => {
            if(err){
              response.err = err;
            }else{
              console.log("Succesfully updated user friendlist");
              response.result = true;
            }*/

            
        
        }else{
          // Add new user to DB with new friend: 1-element friendlist array
          this.add({ _id: uid, friendlist: [{friendid: friendId, friendusername: friendname}], username: username }, (r) => {
            if(!r.result){
              response.err = r.err;
            }else{
              console.log("New Friend Element is added to database....");
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
    deleteFriendship: function (uid1, uid2, username , friendname , callback) {
      const response = { result: false };

      // User "uid1": remove friend "uid2"
      this.removeFriend(uid1, uid2, friendname , (r) => {
        if(!r.result){
          response.err = r.err;
          return callback(response);
        }

        // User "uid2": remove friend "uid1"
        this.removeFriend(uid2, uid1, username , (r) => {
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
    removeFriend: function (uid, friendId, username , friendname, callback) {
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
    },
    /**/
    findFriends: function (userId, callback) {
      const response = { result: false };

      // Find user in DB
      this.Model.find( { "friendlist.friendid": { "$in" : [userId]} }, (err, result) => {
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
