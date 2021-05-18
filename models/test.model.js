const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    time: Number,
    name: String,
    deadline: {type: Date, default: new Date()},
    isPublic: {type: Boolean, default: false},
    grade: {type: Number, default: 12}
})

module.exports =  mongoose.model('Test', testSchema);