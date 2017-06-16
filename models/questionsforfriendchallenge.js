var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/tempswot');
var mongoSchema =   mongoose.Schema;
var QuestionsSchema  = {                      // BURDA NIYE new mongoSchema demiyo.
    "currentTimeInSeconds": Number,
    "invitinguserid" : String,
    "inviteduserid" : String,
    "categoryid"      : mongoSchema.Types.ObjectId,
    "categoryname"     : String,
    "questions"   : [{
        "correctAnswerIndex" : Number,
        "supplementalInfoHtml" : String,
        "questionHtml" : String,
        "choices" : [String]
    }],
    "currentTime" : Number,
    "timeoutTime" : Number,
  //  "usersThatDidntDeleteGame": [String],
    "completed": Number
};
module.exports = mongoose.model('questionsforfriendchallenge',QuestionsSchema);