/**
 * Created by Portaman on 8/30/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

module.exports = function () {
    var PlayerSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, "e-mail is not valid"] },
        password: { type: String, required: true },
        resetPasswordToken: String,
        resetPasswordExpires: Date
    });

//Mongoose

    PlayerSchema.pre('save', function(next) {
        var user = this;
        var SALT_FACTOR = 5;

        if (!user.isModified('password')) return next();

        bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, null, function(err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    });

    PlayerSchema.methods.comparePassword = function(candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    };

    return mongoose.model('Player', PlayerSchema);
}();