import express from 'express';
import AdminController from '../controllers/adminController.js';
// import { verifyToken } from "../config/jwt.js";  // Import the middleware


const router = express.Router();

// main
router.get('/v1/notifications', AdminController.getNotifications);
router.get('/v1/dashboard',  AdminController.getDashboard);
router.get('/v1/setting',  AdminController.getSetting);
router.get('/v1/feedbacks',  AdminController.getFeedbacks);
router.put('/v1/update',  AdminController.updateInfo);
// router.put('/change-password',  AdminController.updatePassword);

// Routes - Buses
router.get('/v1/routes',  AdminController.getAllRoutes);
router.get('/v1/routes/:bus_id',  AdminController.getBusInfo);
router.post('/v1/routes',  AdminController.addBus);
router.delete('/v1/routes/:bus_ids',  AdminController.deleteBus);

// Assign and Unassign
router.get('/v1/drivers/unassigned', AdminController.getUnassignedDrivers);
router.patch('/v1/routes/:bus_id/driver/:driver_id', AdminController.assignDriverToBus);
router.get('/v1/teachers/unassigned', AdminController.getUnassignedTeachers);
router.patch('/v1/routes/:bus_id/teacher/:teacher_id', AdminController.assignTeacherToBus);
router.get('/v1/students/no-bus', AdminController.getStudentsWithoutBus);
router.patch('/v1/routes/:bus_id/students/assign-bus', AdminController.assignStudentsToBus);
router.get('/v1/students/no-parents', AdminController.getStudentsWithoutParents);
router.post('/v1/students/assign-parents', AdminController.assignStudentsToParents);

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
router.post('/v1/students',  AdminController.addStudentInfo);
router.get('/v1/students/:student_id',  AdminController.getStudentInfo);
router.put('/v1/students/:student_id',  AdminController.updateStudentInfo);
router.delete('/v1/students/:student_ids',  AdminController.deleteStudent);

router.put('/v1/change-route/:student_id',  AdminController.updateStudentRoute);
//handle add and delete multiple students
// router.put('/v1/upload/:student_id',  AdminController.uploadAvatar);


export default router;
