import express from 'express';
import TeacherController from '../controllers/teacherController.js';

const router = express.Router();

//Pending to use websocket
router.get('/homepage/:teacher_id', TeacherController.getHomepage); // remember to filter the status
// router.get('/notification/:teacher_id', TeacherController.getTeacherProfile);

// pending Upload to Drive
// router.put('/broken-photo/:teacher_id', TeacherController.getNotifications);
// router.put('/emergency-photo/:teacher_id', TeacherController.getBusTracking); // store in noti, set alight as common

router.get('/students/:teacher_id', TeacherController.getStudentsInformation);
router.get('/setting/:teacher_id', TeacherController.getSetting);
router.put('/setting/:teacher_id', TeacherController.updateProfile);
router.post('/feedback/:teacher_id', TeacherController.writeFeedback);
//change password

export default router;
