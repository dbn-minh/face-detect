import express from 'express';
import ParentController from '../controllers/ParentController.js';

const router = express.Router();


router.get('/home/:parent_id', ParentController.getParentHome);
router.get('/student/:parent_id', ParentController.getStudentInformation);
router.get('/notification/:parent_id', ParentController.getNotifications);



// router.get('/profile/:parent_id', ParentController.getParentProfile);
// router.put('/profile/:parent_id', ParentController.updateParentProfile);
// router.post('/register/:parent_id', ParentController.registerStudent);
// router.get('/tracking/:parent_id', ParentController.getBusTracking);

export default router;
