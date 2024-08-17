import express from 'express';
import AdminController from '../controllers/AdminController.js';

const router = express.Router();

router.get('/details', AdminController.getAdminDetails);
router.get('/notification', AdminController.getNotifications);
// router.get('/tracking/:admin_id', AdminController.getAdminTracking);

router.get('/profile', AdminController.getAdminProfile);
router.post('/profile/:admin_id', AdminController.createAdminProfile);
router.put('/profile/:admin_id', AdminController.updateAdminProfile);
router.delete('/profile/:admin_id', AdminController.deleteAdminProfile);

router.get('/register-student', AdminController.listPendingRegistrations);
router.post('/adjust-student', AdminController.adjustBusAssignments);

export default router;
