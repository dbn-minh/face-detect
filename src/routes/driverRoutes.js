import express from 'express';
import DriverController from '../controllers/DriverController.js';

const router = express.Router();

router.get('/details/:driver_id', DriverController.getDriverDetails);

router.get('/profile/:id', DriverController.getDriverProfile);
router.post('/profile/:id', DriverController.createDriverProfile);
router.put('/profile/:id', DriverController.updateDriverProfile);
router.delete('/profile/:id', DriverController.deleteDriverProfile);
router.post('/logout', DriverController.logoutDriver);

export default router;
