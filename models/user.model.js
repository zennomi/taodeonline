const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, index: true, unique: true},
    password: String,
    role: {
        type: String,
        enum: ['admin', 'mod', 'tutor', 'teacher']
    },
    name: String,
    last_login: Date,
    note: String
})

userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;