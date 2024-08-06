import express from 'express';
import AdminController from '../controllers/AdminController.js';

const router = express.Router();

router.get('/details/teacher/:teacher_id', AdminController.getTeacherDetails);
router.get('/notification/teacher/:id', AdminController.getTeacherNotifications);
router.get('/tracking', AdminController.getAdminTracking);

router.get('/profile', AdminController.getAdminProfile);
router.post('/profile', AdminController.createAdminProfile);
router.put('/profile', AdminController.updateAdminProfile);
router.delete('/profile', AdminController.deleteAdminProfile);

router.get('/register-student', AdminController.listPendingRegistrations);
router.post('/adjust', AdminController.adjustBusAssignments);
router.post('/logout', AdminController.logoutAdmin);

export default router;
