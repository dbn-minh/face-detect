import express from 'express';
import ParentController from '../controllers/ParentController.js';
const router = express.Router();
import upload from '../config/multer.js';


router.get('/home/:parent_id', ParentController.getParentHome);
router.get('/student/:parent_id', ParentController.getStudentInformation);
router.get('/notification/:parent_id', ParentController.getNotifications);
router.get('/setting/:parent_id', ParentController.getParentSetting);
router.put('/setting/:parent_id', ParentController.updateParentSetting);
router.put('/avatar/:parent_id', upload.single('avatar'), ParentController.uploadStudentAvatar);

// router.put('change-pass/:parent_id', AuthController.updatePassword);


// router.get('/profile/:parent_id', ParentController.getParentProfile);
// router.put('/profile/:parent_id', ParentController.updateParentProfile);
// router.post('/register/:parent_id', ParentController.registerStudent);
// router.get('/tracking/:parent_id', ParentController.getBusTracking);

export default router;
