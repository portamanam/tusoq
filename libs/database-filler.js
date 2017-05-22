/*  
 *  Name: database-filler.js
 *  Function: prepare functions for clearing and filling our DB
 *  Warning: only for development/testing purposes
 */

// Import libraries
const mongoose = require('mongoose');
const config   = require('../config.js');
const User     = require('../models/friend.js');

// Get current environment: production/development
const environment = process.env.NODE_ENV || 'development';

// Export
module.exports = {
  // Clear whole collection (all user data)
  clearCollection: function (callback) {
    // Work only on "development" environment
    if(environment === 'development'){
      User.Model.collection.drop(() => {
        if(callback){
          callback();
        }
      });
    }
  },

  // Fill DB with sample data
  sampleData: function (callback) {
    // Work only on "development" environment
    if(environment === 'development'){
      User.add({ _id: 1, friendlist: [2, 3] });
      User.add({ _id: 2, friendlist: [1, 3] });
      User.add({ _id: 3, friendlist: [1, 2] });
      User.add({ _id: 4, friendlist: [5] });
      User.add({ _id: 5, friendlist: [4] }, () => {
        if(callback){
          callback();
        }
      });
    }
  },

  /*  
   *  Function: insert fixed amount of users into DB
   *  Params: users (int) - amount of users to add
   *          conn (int) - amount of friends each user should have (edge users will have half)
   *          start (int) - from what ID users should be enumerated
   */
  fixedAmount: function (users, conn, start, callback) {
    // Work only on "development" environment
    if(environment === 'development'){
      let friendIdLowest;
      let friendIdHighest;
      let friendlist;
      let i;
      let j;

      // Add "users" amount of users from "start" ID
      for(i = start; i <= users+start-1; i++){
        friendIdLowest  = i - (conn/2) < 1 ? 1 : i - (conn/2);
        friendIdHighest = i + (conn/2) > users ? users : i + (conn/2);

        friendlist = [];

        // Add friends to friendlist
        for(j = friendIdLowest; j <= friendIdHighest; j++){
          // Do not add user himself
          if(i != j){
            friendlist.push(j);
          }
        }

        // Insert user to DB
        User.Model.collection.insert({ _id: i, friendlist: friendlist });
      }

      // Call back after setting up insert queue (all users might not be already added)
      if(callback){
        callback();
      }
    }
  }
}
