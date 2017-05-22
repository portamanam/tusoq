var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/tempswot');
var mongoSchema =   mongoose.Schema;
var OnlineUserSchema  = {
    "socketid" : String,
    "_id"      : mongoSchema.Types.ObjectId,
    "username" : String

};
module.exports = mongoose.model('onlineusers',OnlineUserSchema);