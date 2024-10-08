import express from 'express';
import DriverController from '../controllers/DriverController.js';

const router = express.Router();
//Get details of the students have the same driver_id
router.get('/details/:driver_id', DriverController.getDriverDetails);
router.get('/profile/:driver_id', DriverController.getDriverProfile);
router.put('/profile/:driver_id', DriverController.updateDriverProfile);

export default router;
