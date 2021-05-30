const express = require('express');
const controller = require('../controllers/test.controller');
const premiumController = require('../controllers/premiumTest.controller');
const authMiddlewares = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/', controller.index);
router.get('/create', controller.create);
router.get('/auto-create', authMiddlewares.authRequire, controller.autoCreate);
router.post('/auto-create', authMiddlewares.authRequire, controller.postAutoCreate);
router.get('/guide', controller.guide);
router.get('/:id/view', authMiddlewares.adminRequire, controller.view);
router.get('/:id/view-result/:resultId', authMiddlewares.authRequire, controller.viewResult);
router.get('/:id/do', authMiddlewares.authRequire, controller.do);
router.get('/:id/edit', authMiddlewares.authRequire, controller.edit);
router.get('/:id/delete', authMiddlewares.authRequire, controller.delete);
router.post('/:id/edit', authMiddlewares.authRequire, controller.postEdit);
router.post('/:id/delete', authMiddlewares.authRequire, controller.postDelete);

module.exports = router;