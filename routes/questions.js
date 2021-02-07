const express = require('express');
const controller = require('../controllers/question.controller');
const authMiddlewares = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/create', authMiddlewares.authRequire, controller.create);
router.post('/create', authMiddlewares.authRequire, controller.postCreate);
router.get('/', controller.index);
router.get('/export', authMiddlewares.authRequire, controller.export);
router.get('/import', controller.import);
router.post('/import', controller.postImport);
router.get('/import/save', controller.saveImportedQuestions);
router.get('/:id', controller.view);
router.get('/:id/view', controller.view);
router.get('/:id/edit', authMiddlewares.authRequire, controller.edit);
router.post('/:id/edit', authMiddlewares.authRequire, controller.postEdit);
router.get('/:id/delete', authMiddlewares.authRequire, controller.delete);

module.exports = router;
