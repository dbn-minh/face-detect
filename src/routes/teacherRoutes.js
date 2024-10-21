import express from 'express';
import TeacherController from '../controllers/teacherController.js';

const router = express.Router();

//Pending to use websocket
router.get('/v1/homepage/:teacher_id', TeacherController.getHomepage); // remember to filter the status
// router.get('/notification/:teacher_id', TeacherController.getTeacherProfile);

// pending Upload to Drive
// router.put('/broken-photo/:teacher_id', TeacherController.getNotifications);
// router.put('/emergency-photo/:teacher_id', TeacherController.getBusTracking); // store in noti, set alight as common

router.get('/v1/students/:teacher_id', TeacherController.getStudentsInformation);
router.get('/v1/setting/:teacher_id', TeacherController.getSetting);
router.put('/v1/setting/:teacher_id', TeacherController.updateProfile);
router.post('/v1/feedback/:teacher_id', TeacherController.writeFeedback);
//change password

export default router;
