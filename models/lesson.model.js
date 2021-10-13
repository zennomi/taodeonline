const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
    date: {
        type: String,
        required: true,
        index: true
    },
    student_id: {
        type: Schema.Types.ObjectId,
        index: true,
        required: true,
        ref: 'Student'
    },
    type: {
        type: String,
        enum: ['Lý thuyết', 'Bài tập']
    },
    time: {
        start_hour: Number,
        start_minute: Number,
        end_hour: Number,
        end_minute: Number
    },
    topic: String,
    total_problems: Number,
    rating: {
        type: Number,
        max: 10,
        min: 0
    },
    comment_of_student: String,
    comment_of_tutor: String,
    last_update: {
        time: {type: Date, default: Date.now},
        user: {type: Schema.Types.ObjectId, ref: 'User'}
    }
});

lessonSchema.index({ date: -1, student_id: 1 });

lessonSchema.methods.getDetailedDate = function () {
    let date = new Date(this.date);
    let day = date.getUTCDay();
    if (date.getUTCDay() != 0) {
        day = 'Thứ ' + (day+1)
    } else {
        day = 'Chủ nhật'
    }
    return `${day} ${this.date.slice(8,10)}/${this.date.slice(5,7)}`
}
lessonSchema.methods.getDetailedTime = function () {
    return (this.time.start_hour<10?'0':'') + this.time.start_hour + (this.time.start_minute<10?':0':':') + this.time.start_minute + (this.time.end_hour?' - ' + this.time.end_hour + (this.time.end_minute<10?':0':':') + this.time.end_minute:'')
}
const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;