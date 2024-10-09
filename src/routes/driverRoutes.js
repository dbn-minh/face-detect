import express from 'express';
import DriverController from '../controllers/DriverController.js';
import upload from "../config/multer.js";

const router = express.Router();

router.get('/details/:driver_id', DriverController.getDriverDetails);
router.get('/setting/:driver_id', DriverController.getDriverSetting);
// router.post('/feedback/:driver_id', DriverController.updateDriverProfile);

// router.put('/change-password/:driver_id', DriverController.updateDriverProfile);
// router.put('/avatar/:driver_id', upload.single('avatar'), DriverController.uploadAvatar);

export default router;
