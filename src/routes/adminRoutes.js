import express from 'express';
import AdminController from '../controllers/adminController.js';
import { verifyToken } from "../config/jwt.js";  // Import the middleware


const router = express.Router();

router.get('/details', AdminController.getAdminDetails);
router.get('/notification', AdminController.getNotifications);
// router.get('/tracking/:admin_id', AdminController.getAdminTracking);

//Chưa sử dụng được xuất ra từ login
router.get('/profile', verifyToken,  AdminController.getAdminProfile);
router.post('/profile/:admin_id', AdminController.createAdminProfile);
router.put('/profile/:admin_id', AdminController.updateAdminProfile);
router.delete('/profile/:admin_id', AdminController.deleteAdminProfile);

router.get('/register-student', AdminController.listPendingRegistrations);
router.post('/adjust-student', AdminController.adjustBusAssignments);

export default router;
