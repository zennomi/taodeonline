const express = require('express');
const controller = require('../controllers/question.controller');

const router = express.Router();

router.get('/create', controller.create);
router.post('/create', controller.postCreate);
router.get('/', controller.index);
router.get('/export', controller.export);
router.get('/:id', controller.view);
router.get('/:id/view', controller.view);
router.get('/:id/edit', controller.edit);
router.post('/:id/edit', controller.postEdit);
router.get('/:id/delete', controller.delete);

module.exports = router;
