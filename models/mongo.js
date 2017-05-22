var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/tempswot');
var mongoSchema =   mongoose.Schema;
var userSchema  = {
    "email" : String,
    "password" : String,
    "topics" : [mongoSchema.Types.ObjectId],
    "quizzes" : [mongoSchema.Types.ObjectId]
};
module.exports = mongoose.model('users',userSchema);;
