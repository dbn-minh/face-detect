import express from 'express';
import AdminController from '../controllers/adminController.js';
import { verifyToken } from "../config/jwt.js";  // Import the middleware


const router = express.Router();

// main
router.get('/v1/notifications', AdminController.getNotifications);
router.get('/v1/dashboard',  AdminController.getDashboard);
router.get('/v1/setting',  AdminController.getSetting);
router.get('/v1/re  port',  AdminController.getReport);
router.put('/v1/update',  AdminController.updateInfo);
// router.put('/change-password',  AdminController.updatePassword);

// Routes - Buses
router.get('/v1/routes',  AdminController.getAllRoutes);
router.get('/v1/routes/:bus_id',  AdminController.getBusInfo);
// Pending: get all Student which are not assign to bus
router.put('/v1/routes/:bus_id',  AdminController.updateBusInfo); // Pending: Should update bus_id to multiple students
router.post('/v1/routes',  AdminController.addBus);
router.delete('/v1/routes/:bus_id',  AdminController.deleteBus);

// Driver
router.get('/v1/drivers',  AdminController.getAllDrivers);
router.post('/v1/drivers',  AdminController.addDriver);
router.put('/v1/drivers/:user_id',  AdminController.updateDriverInfo);
router.delete('/v1/drivers/:user_ids',  AdminController.deleteDriver);

// Parent
router.get('/v1/parents',  AdminController.getAllParents);
router.post('/v1/parents',  AdminController.addParent);
router.put('/v1/parents/:user_id',  AdminController.updateParentInfo);
router.delete('/v1/parents/:user_ids',  AdminController.deleteParent);

// Teacher
router.get('/v1/teachers',  AdminController.getAllTeachers);
router.post('/v1/teachers',  AdminController.addTeacher);
router.put('/v1/teachers/:user_id',  AdminController.updateTeacherInfo);
router.delete('/v1/teachers/:user_ids',  AdminController.deleteTeacher);

// Student
router.get('/v1/students',  AdminController.getAllStudents);

router.post('/v1/routes/:bus_id/add-student',  AdminController.addStudentToBus);
router.get('/v1/student-info/:student_id',  AdminController.getStudentInfo);
router.put('/v1/student-info/:student_id',  AdminController.updateStudentInfo);
router.post('/v1/student-info/:student_id',  AdminController.addStudentInfo);
router.put('/v1/change-route/:student_id',  AdminController.updateStudentRoute);
router.delete('/v1/delete-student/:student_id',  AdminController.deleteStudent);
//handle add and delete multiple students
// router.put('/v1/upload/:student_id',  AdminController.uploadAvatar);


export default router;
