import express from 'express';
import TeacherController from '../controllers/teacherController.js';
import photoUpload from "../config/multer.js";

const router = express.Router();

//Pending to use websocket
router.get('/v1/homepage/:teacher_id', TeacherController.getHomepage); // remember to filter the status
router.get('/v1/notification/:teacher_id', TeacherController.getNotifications);
router.get('/v1/students/:teacher_id', TeacherController.getStudentsInformation);
router.get('/v1/setting/:teacher_id', TeacherController.getSetting);
router.put('/v1/setting/:teacher_id', TeacherController.updateProfile);
router.post('/v1/feedback/:teacher_id', TeacherController.writeFeedback);

// pending Upload to Drive
router.get('/v1/students-for-dropdown/:teacher_id', TeacherController.getStudentsForDropdown);
router.put('/v1/broken-photo/:teacher_id', photoUpload.single('photo'), TeacherController.uploadBrokenPhotos);
router.put('/v1/emergency-photo/:teacher_id', photoUpload.single('photo'), TeacherController.uploadEmergencyPhoto);
//Thêm API confirm học sinh đó đã an toàn, put alert thành common, alighted
//change password

export default router;
