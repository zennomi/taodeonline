const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    name: String,
    grade: Number,
    note: String,
    test_ids: [{ type: Schema.Types.ObjectId, ref: 'Test' }],
    description: String,
    original_price: Number,
    public_price: Number,
    img_link: {
        type: String,
        default: '/img/logo.jpg'
    },
    logged_user_ids: [String]
})

module.exports = mongoose.model('Course', courseSchema);