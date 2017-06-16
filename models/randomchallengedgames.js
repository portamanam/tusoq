var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/tempswot');
var mongoSchema =   mongoose.Schema;
var RandomChallengedGamesSchema  = {
    "roomId" : String,
    "currentTimeInSeconds" : Number,
    "categoryid" : String,
    "categoryname" : String,
    "completed"   : Number,
    "infoForRankings"   : [{
                        "socketInfo" : String,
                        "userScore" : Number,
                        "updaterUsername" : String,
                        "connectionIndex" : Number,
                        "userTime" : Number                      
                       }],
    "questionData" : [String],                   
    "timeoutTime" : Number,
    "usersThatDidntDeleteGame": [String],
    "isCurrentViewerDeletedDiv": Boolean    
};
module.exports = mongoose.model('games',RandomChallengedGamesSchema);
