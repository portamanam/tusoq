/**
 * Created by Portaman on 8/7/2016.
 */
var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/swot');
var mongoSchema =   mongoose.Schema;
var quizSchema  = {
    "name"        : String,
    "topic"       : mongoSchema.Types.ObjectId,
    "dateCreated" : Date,
    "createdBy"   : mongoSchema.Types.ObjectId,
    "questions"   : [{
                        "correctAnswerIndex" : Number,
                        "supplementalInfoHtml" : String,
                        "questionHtml" : String,
                        "choices" : [String]
                    }]

};
module.exports = mongoose.model('quizzes',quizSchema);;
