const express = require('express');
const router = express.Router();
const controller = require('../controllers/question.controller');


// CRUD
router.get('/', controller.index);
router.get('/:id/view', controller.view);
router.post('/create', controller.create);
router.put('/:id/edit', controller.edit);
router.delete('/:id/delete', controller.delete);

// Cookie
router.get('/memory', controller.getQuestionCookie);
router.post('/memory/', controller.postQuestionCookie);
router.delete('/memory/', controller.deleteQuestionCookie);
router.post('/memory/order', controller.postQuestionOrder);

module.exports = router;