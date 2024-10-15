import express from 'express';
import ParentController from '../controllers/ParentController.js';
const router = express.Router();
import upload from '../config/multer.js';


router.get('/v1/home/:parent_id', ParentController.getParentHome);
// router.get('/photo/:parent_id', ParentController.getEmergencyPhoto);
router.get('/v1/student/:parent_id', ParentController.getStudentInformation);
router.get('/v1/notification/:parent_id', ParentController.getNotifications);
router.get('/v1/setting/:parent_id', ParentController.getParentSetting);
router.put('/v1/setting/:parent_id', ParentController.updateParentSetting);
router.post('/v1/feedback/:parent_id', ParentController.writeFeedback);

// pending
router.put('/avatar/:parent_id', upload.single('avatar'), ParentController.uploadStudentAvatar);
// router.put('change-pass/:parent_id', AuthController.updatePassword);
// Call emergency endpoint
// view alighted photo after emergency

export default router;
