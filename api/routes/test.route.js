const express = require('express');
const router = express.Router();
const controller = require('../controllers/test.controller');

const authMiddlewares = require('../middlewares/auth.middleware');


// router.get('/:id/true-choices', controller.getCorrectAnswer);
router.get('/:id/result',authMiddlewares.adminRequire,controller.getResult);
router.get('/:id/view',authMiddlewares.adminRequire, controller.view);
router.get('/:id/detail', authMiddlewares.authRequire ,controller.getDetail);
router.get('/auto-create', controller.autoCreate);
// CRUD
router.get('/',controller.index);
router.post('/create',authMiddlewares.adminRequire,controller.create);
router.put('/:id/edit',authMiddlewares.adminRequire,controller.edit);
router.delete('/:id/delete',authMiddlewares.adminRequire,controller.delete);

module.exports = router;