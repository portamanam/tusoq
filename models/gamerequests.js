var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/tempswot');
var mongoSchema =   mongoose.Schema;
var GameRequestSchema  = {
    "invitingusername" : String,
    "invitedusername" : String,
    "categoryid"      : mongoSchema.Types.ObjectId,
    "categoryname"     : String,
    "questions"   : [{
        "correctAnswerIndex" : Number,
        "supplementalInfoHtml" : String,
        "questionHtml" : String,
        "choices" : [String]
    }],
    "currentTime" : Number,
    "timeoutTime" : Number

};
module.exports = mongoose.model('gamerequests',GameRequestSchema);