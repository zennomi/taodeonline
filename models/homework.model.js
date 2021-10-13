const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homeworkSchema = new Schema({
    date: Date,
    name: String,
    note: String,
    class: {type: Schema.Types.ObjectId, ref: 'Classroom'},
    total: {type: Number, default: 100},
    student: [{
        student_id: {type: Schema.Types.ObjectId, ref: 'Student'},
        finish_count: Number,
        note: String
    }]
})

const Homework = mongoose.model('Homework', homeworkSchema);

module.exports = Homework;