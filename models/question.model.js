const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const tagSchema = new Schema({
    _id: false,
    value: String,
    grade: Number
})

const questionSchema = new Schema({
    question: String,
    choices: [{
        content: String,
        isTrue: Boolean
    }],
    answer: String,
    grade: Number,
    level: {
        type: Number,
        default: 11
    },
    main_tags: [tagSchema],
    side_tags: [tagSchema]
});

questionSchema.methods.getMaxLengthChoice = function() {
    return Math.max(...this.choices.map(c => c.content.replace(/<.*>/g, "").length))
}

questionSchema.methods.getTrueChoice = function() {
    let keyArr = [];
    this.choices.forEach((c, i) => {
        if (c.isTrue == true) keyArr.push(String.fromCharCode(65 + i));
    });
    return keyArr.join(",");
}

questionSchema.methods.getTrueChoiceArray = function() {
    return this.choices.filter(c => c.isTrue).map(c => String(c._id));
}

questionSchema.methods.getFalseChoiceArray = function() {
    return this.choices.filter(c => !c.isTrue).map(c => String(c._id));
}

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;