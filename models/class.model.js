const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Student = require('./student.model');

const classroomSchema = new Schema({
    name: {type: String, index: true, unique: true}
})

classroomSchema.index({ name: 1 });
const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;