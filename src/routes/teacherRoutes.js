import express from 'express';
import TeacherController from '../controllers/teacherController.js';

const router = express.Router();

router.get('/homepage/:teacher_id', TeacherController.getHomepage); // remember to filter the status
// router.get('/broken-photo/:teacher_id', TeacherController.getNotifications);
// router.get('/emergency-photo/:teacher_id', TeacherController.getBusTracking); // store in noti, set alight as common
// router.get('/notification/:teacher_id', TeacherController.getTeacherProfile);
// router.get('/students/:teacher_id', TeacherController.updateTeacherProfile);
// router.get('/setting/:teacher_id', TeacherController.updateTeacherProfile);
// router.put('/setting/:teacher_id', TeacherController.updateTeacherProfile);
// router.post('/feedback/:teacher_id', TeacherController.updateTeacherProfile);
//change password

export default router;
