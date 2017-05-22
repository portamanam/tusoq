var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/tempswot');
var mongoSchema =   mongoose.Schema;
var GameSchema  = {
    "username" : String,
    "gamename" : String,
    "categoryid" : String,
    "categoryname" : String,
    "completed"   : Number,
    "gameContent"   : [{
                        "socketInfo" : String,
                        "scoreInfo" : Number,
                        "usernameInfo" : String,
                        "connectionIndex" : Number
                       }],
    "timeoutTime" : Number                       
};
module.exports = mongoose.model('games',GameSchema);
