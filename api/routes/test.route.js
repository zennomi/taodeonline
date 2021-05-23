const express = require('express');
const router = express.Router();

const Test = require('../../models/test.model');
const Result = require('../../models/result.model');

const authMiddlewares = require('../middlewares/auth.middleware');

router.get('/:id/true-choices', async (req, res) => {
    let matchedTest = await Test.findById(req.params.id).populate('questions');
    if (!matchedTest) {
      res.status(404).json({error: 'Không thấy bài kiểm tra tương ứng.'});
      return;
    }
    res.status(200).json({
        result: matchedTest.questions.map(q => q.choices.filter(c => c.isTrue)[0]._id),
        isPublic: matchedTest.isPublic
    });
})

module.exports = router;