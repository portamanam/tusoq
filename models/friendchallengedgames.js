var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/tempswot');
var mongoSchema =   mongoose.Schema;
var FriendChallengedGameSchema  = {                      // BURDA NIYE new mongoSchema demiyo.
    "currentTimeInSeconds": Number,
    "invitingusername" : String,
    "invitedusername" : String,
    "invitinguserid" : String,
    "inviteduserid" : String,
    "categoryid"      : mongoSchema.Types.ObjectId,
    "categoryname"     : String,
   /* "questions"   : [{
        "correctAnswerIndex" : Number,
        "supplementalInfoHtml" : String,
        "questionHtml" : String,
        "choices" : [String]
    }],*/
    "timeoutTime" : Number,
    "isExpired"   : Boolean,
    "isDeclined"  : Boolean,
    "scoreArrayForChallengeRank": [{
                    "updaterUsername": String,
                    "userScore" : Number,
                    "userTime" : Number,
                }],
    "usersThatDidntDeleteGame": [String],
    "completed": Number,
    "isCurrentViewerDeletedDiv": Boolean
};
module.exports = mongoose.model('friendchallengedgames',FriendChallengedGameSchema);