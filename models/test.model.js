const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    time: Number,
    name: String
})

module.exports =  mongoose.model('Test', testSchema);