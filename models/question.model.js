const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    question: String,
    choices: [{
        content: String,
        isTrue: Boolean
    }],
    answer: String,
    grade: Number,
    tags: [String]
});

questionSchema.methods.getMaxLengthChoice = function () {
    return Math.max(...this.choices.map(c => c.content.replace(/<.*>/g,"").length))
}

questionSchema.methods.getTrueChoice = function () {
    let keyArr = [];
    this.choices.forEach((c, i) => {
        if (c.isTrue == true) keyArr.push(String.fromCharCode(65+i));
    });
    return keyArr.join(",");
}

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;