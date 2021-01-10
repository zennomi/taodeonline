const express = require('express');
const controller = require('../controllers/test.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/create', controller.create);
router.get('/auto-create', controller.autoCreate);
router.post('/auto-create', controller.postAutoCreate);
router.get('/:id/view', controller.view);
module.exports = router;