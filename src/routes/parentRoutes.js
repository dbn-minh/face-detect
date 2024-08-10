import express from 'express';
import ParentController from '../controllers/ParentController.js';

const router = express.Router();

router.get('/details/parent/:id', ParentController.getParentDetails);


router.get('/notification/parent/:id', ParentController.getNotifications);
router.get('/tracking/:id', ParentController.getBusTracking);

router.get('/profile/:parent_id', ParentController.getParentProfile);
router.post('/profile/:parent_id', ParentController.createParentProfile);
router.put('/profile/:parent_id', ParentController.updateParentProfile);
router.delete('/profile/:parent_id', ParentController.deleteParentProfile);

router.post('/register', ParentController.registerStudent);
router.post('/logout', ParentController.logoutParent);

export default router;
