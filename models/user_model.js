const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    username: String,
    githubId: String,
    icon_url: String,
    accessToken: String
});


const User = mongoose.model('user', userSchema);

module.exports = User;
