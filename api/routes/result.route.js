const express = require('express');
const router = express.Router();
const Result = require('../../models/result.model');
const controller = require('../controllers/result.controller');
const authMiddlewares = require('../middlewares/auth.middleware');

router.post('/', authMiddlewares.authRequire, controller.post)

router.put('/:id', authMiddlewares.authRequire, controller.put)

router.delete('/:id', controller.delete);

module.exports = router;