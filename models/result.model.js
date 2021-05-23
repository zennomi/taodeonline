const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const choiceSchema = new Schema({
    _id: false,
    choice_id: Schema.Types.ObjectId,
    moment: Date
})

const resultSchema = new Schema({
    test_id: { type: Schema.Types.ObjectId, ref: 'Test' },
    user: {
        facebook_id: String,
        display_name: String,
        ip: String,
        software: String
    },
    started_time: Date,
    finished_time: Date,
    last_updates: Date,
    leaves_area_times: Number,
    choices: [choiceSchema]
})

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;