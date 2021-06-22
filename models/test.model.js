const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    time: Number,
    name: String,
    deadline: { type: Date, default: new Date() },
    grade: { type: Number, default: 12 },
    link_pdf: String,
    link_fb_live: String,
    note: String,
    isPublic: { type: Boolean, default: false },
    isPremium: {
        type: Boolean,
        default: false
    },
    isShuffled: {
        type: Boolean,
        default: true
    },
    isSorted: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Test', testSchema);