var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function () {
    var FacebookPlayerSchema = new mongoose.Schema({
        username: { type: String, required: true },               
        facebookId: { type: String, required: true, unique: true }
    //  facebookToken: { type: String, required: true, unique: true },
    });

return mongoose.model('FacebookPlayer', FacebookPlayerSchema);
}();