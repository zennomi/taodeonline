const express = require('express');
const router = express.Router();

router.get('/memory', (req, res) => {
    res.status(200).json({
        questionsIds: req.cookies.questions ? req.cookies.questions.ids : []
    })
})

router.post('/memory/', (req, res) => {
    let response = {};
    if (!req.cookies.questions) {
        res.cookie('questions', { ids: [req.body.questionId] }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true });
        response.message = "Thêm câu hỏi thành công! Đang có 1 câu hỏi trong bộ nhớ";
        response.ids = req.cookies.questions.ids;
        res.status(200).json(response);
        return;
    }
    if (req.cookies.questions.ids.indexOf(req.body.questionId) > -1) {
        response.error = "Câu hỏi này đã có trong bộ nhớ.";
        res.status(200).json(response);
        return;
    }
    req.cookies.questions.ids.push(req.body.questionId);
    res.cookie('questions', { ids: req.cookies.questions.ids }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true })
    response.message = `Thêm câu hỏi thành công! Đang có ${req.cookies.questions.ids.length} câu hỏi trong bộ nhớ`;
    response.ids = req.cookies.questions.ids;
    res.status(200).json(response);
})

router.delete('/memory/', (req, res) => {
    let response = {};
    if (!req.cookies.questions.ids) {
        return res.status(200).json({
            error: "Không có câu hỏi lưu trong bộ nhớ."
        })
    }
    let newQuesIds = req.cookies.questions.ids.filter(id => id != req.body.questionId);
    res.cookie('questions', { ids: newQuesIds }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true })
    response.message = `Xóa câu hỏi thành công! Đang có ${newQuesIds.length} câu hỏi trong bộ nhớ.`;
    response.ids = newQuesIds;
    res.status(200).json(response);
    return;
})

router.post('/memory/order', (req, res) => {
    let response = {};
    res.cookie('questions', { ids: req.body.order ? req.body.order : [] }, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true })
    res.status(200).json(response);
    return;
})

module.exports = router;