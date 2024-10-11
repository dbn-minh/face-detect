import express from 'express';
import ParentController from '../controllers/ParentController.js';
const router = express.Router();
import upload from '../config/multer.js';


router.get('/home/:parent_id', ParentController.getParentHome);
// router.get('/photo/:parent_id', ParentController.getEmergencyPhoto);
router.get('/student/:parent_id', ParentController.getStudentInformation);
router.get('/notification/:parent_id', ParentController.getNotifications);
router.get('/setting/:parent_id', ParentController.getParentSetting);
router.put('/setting/:parent_id', ParentController.updateParentSetting);
router.post('/feedback/:parent_id', ParentController.writeFeedback);

// pending
router.put('/avatar/:parent_id', upload.single('avatar'), ParentController.uploadStudentAvatar);
// router.put('change-pass/:parent_id', AuthController.updatePassword);
// Call emergency endpoint
// view alighted photo after emergency

export default router;
