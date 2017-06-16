/**
 * Created by Portaman on 8/7/2016.
 */
var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/swot');
var mongoSchema =   mongoose.Schema;
var topicSchema  = {
    "_id"         : mongoSchema.Types.ObjectId,
    "name"        : String,
    "dateCreated" : Date,
    "createdBy"   : mongoSchema.Types.ObjectId,
    "parent"      : Number,
    "subtopics"   : [Number],
    "quizzes"     : [mongoSchema.Types.ObjectId],
    "_v"          : Number
};
module.exports = mongoose.model('topics',topicSchema);;
