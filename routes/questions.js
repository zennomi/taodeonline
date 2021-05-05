const express = require('express');
const controller = require('../controllers/question.controller');
const authMiddlewares = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/create', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.create);
router.post('/create', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.postCreate);
router.get('/', controller.index);
router.get('/export', authMiddlewares.authRequire, controller.export);
router.get('/import',authMiddlewares.authRequire, authMiddlewares.adminRequire,  controller.import);
router.post('/import', authMiddlewares.authRequire, authMiddlewares.adminRequire,  controller.postImport);
router.post('/import/save',authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.saveImportedQuestions);
router.get('/:id', controller.view);
router.get('/:id/view', controller.view);
router.get('/:id/edit', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.edit);
router.post('/:id/edit', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.postEdit);
router.get('/:id/delete', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.delete);

module.exports = router;
