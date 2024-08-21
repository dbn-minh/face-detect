import express from 'express';
import AdminController from '../controllers/adminController.js';
import { verifyToken } from "../config/jwt.js";  // Import the middleware


const router = express.Router();

//For warnings and tracking
router.get('/notification', AdminController.getNotifications);
// router.get('/tracking/:admin_id', AdminController.getAdminTracking);

//For all Users
router.get('/profile',  AdminController.getAllUsers);
router.post('/profile', AdminController.createNewProfile);
router.put('/profile/:user_id', AdminController.updateProfiles);
router.delete('/profile/:user_id', AdminController.deleteAdminProfile);

//For Students
router.get('/details', AdminController.getStudentDetails);
router.get('/register-students', AdminController.listPendingRegistrations);
router.get('/teachers', AdminController.getAllTeachers);
router.post('/assign', AdminController.assignTeachersToStudents);
router.put('/adjust/:student_id', AdminController.updateStudentInfo);


export default router;
