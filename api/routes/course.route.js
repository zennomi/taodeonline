const express = require('express');
const router = express.Router();
const controller = require('../controllers/course.controller');

// CRUD
router.get('/', controller.index);
router.post('/create', controller.create);
router.put('/:id/edit', controller.edit);
router.delete('/:id/delete', controller.delete);

router.get('/add-student', controller.addStudent);

module.exports = router;