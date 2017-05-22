var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/tempswot');
var mongoSchema =   mongoose.Schema;
var GamesAcceptedSchema  = {
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
    "gameContent"   : [{
                    "socketInfo" : String,
                    "scoreInfo" : Number,
                    "usernameInfo" : String,
                    "connectionIndex" : Number
                    }]
};
module.exports = mongoose.model('gamesaccepted',GamesAcceptedSchema);