require('dotenv').config();

const fs = require('fs');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homeworkSchema = new Schema({
    date: Date,
    name: String,
    note: String,
    class: { type: Schema.Types.ObjectId, ref: 'Classroom' },
    total: { type: Number, default: 100 },
    student: [{
        student_id: { type: Schema.Types.ObjectId, ref: 'Student' },
        finish_count: Number,
        note: String
    }],
    type: String
})

const Record = mongoose.model('Homework', homeworkSchema);

const Student = require('../models/student.model');
// const Record = require('../models/homework.model');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to MongoDB Atlas.');
}).catch((err) => {
    console.log('Error occurred connecting to MongoDB Atlas');
});

(async function () {
    let results = await Record.aggregate([
        // { $limit: 50 },
        {
            $unwind: {
                path: "$student",
            }
        },
        {
            $match: {
                "student.finish_count": {
                    "$exists": true,
                    "$ne": null
                }
            }
        },
        {
            $group: {
                _id: "$student.student_id",
                first: {
                    $min: "$date"
                },
                last: {
                    $max: "$date"
                }
            }
        },
        {
            $project: {
                _id: 1,
                first: { $dateToString: { format: "%Y-%m-%d", date: "$first" } },
                last: { $dateToString: { format: "%Y-%m-%d", date: "$last" } },
            }
        },
        {
            $lookup: {
                from: "students",
                localField: "_id",    // field in the orders collection
                foreignField: "_id",  // field in the items collection
                as: "student"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$student", 0] }, "$$ROOT"] } }
        },
        {
            $project: {
                name: 1, first: 1, last: 1, classroom: 1
            }
        },
        {
            $lookup: {
                from: "classrooms",
                localField: "classroom",    // field in the orders collection
                foreignField: "_id",  // field in the items collection
                as: "classroom"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$classroom", 0] }, "$$ROOT"] } }
        },
        { $project: { _id: 0, name: 1, first: 1, last: 1, classroom: "$classroom.name" } },
    ]);
    console.log(results);
    fs.writeFileSync('./result', JSON.stringify(results));
})();