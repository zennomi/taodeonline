const express = require('express');
const controller = require('../controllers/course.controller');
const authMiddlewares = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', controller.index);
router.get('/purchased', controller.purchased)
router.get('/all-courses', controller.all);
router.get('/:id/view', controller.courseView);
router.get('/:id/enroll', authMiddlewares.authRequire, controller.courseEnroll);
router.get('/create', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.courseCreate);
router.post('/create', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.postCourseCreate);
router.get('/manage', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.manage);
router.get('/manage/:id/view', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.manageView);
router.post('/manage/:id/add', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.studentAdd);
router.get('/manage/:id/edit', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.courseEdit);
router.post('/manage/:id/edit', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.postCourseEdit);
router.get('/manage/:id/delete', authMiddlewares.authRequire, authMiddlewares.adminRequire, controller.delete);

router.get('/:id/tests/:testId/view', authMiddlewares.authRequire, controller.viewTest);
router.get('/:id/tests/:testId/do', authMiddlewares.authRequire, controller.doTest);
router.post('/:id/tests/:testId/do', authMiddlewares.authRequire, controller.doTest);

module.exports = router;