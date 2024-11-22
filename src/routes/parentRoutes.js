import express from 'express';
import ParentController from '../controllers/ParentController.js';
import {
    checkRefToken,
    checkToken,
    createRefToken,
    createToken,
    decodeToken,
    verifyToken,
  } from "../config/jwt.js";
const router = express.Router();
import photoUpload from "../config/multer.js";


router.get('/v1/home/:parent_id', ParentController.getParentHome);
// router.get('/photo/:parent_id', ParentController.getEmergencyPhoto);
router.get('/v1/student/:parent_id', ParentController.getStudentInformation);
router.get('/v1/notification/:parent_id', ParentController.getNotifications);
router.get('/v1/setting/:parent_id', ParentController.getParentSetting);
router.put('/v1/setting/:parent_id', ParentController.updateParentSetting);
router.post('/v1/feedback/:parent_id', ParentController.writeFeedback);


// pending
router.put('/v1/avatar/:parent_id', photoUpload.single('avatar'), ParentController.uploadStudentAvatar);
router.put('/v1/feature-vector/:parent_id', photoUpload.single('avatar'), ParentController.extractFeature);

// router.put('change-pass/:parent_id', AuthController.updatePassword);

export default router;
