import express from 'express';
import TeacherController from '../controllers/teacherController.js';

const router = express.Router();

router.get('/details/:teacher_id', TeacherController.getTeacherDetails);
router.get('/notification/:teacher_id', TeacherController.getNotifications);
// // router.get('/tracking/:teacher_id', ParentController.getBusTracking);
router.get('/profile/:teacher_id', TeacherController.getTeacherProfile);
router.put('/profile/:teacher_id', TeacherController.updateTeacherProfile);

export default router;
