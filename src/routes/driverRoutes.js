import express from 'express';
import DriverController from '../controllers/driverController.js';
import upload from "../config/multer.js";

const router = express.Router();

router.get('/v1/details/:driver_id', DriverController.getDriverDetails);
router.get('/v1/setting/:driver_id', DriverController.getDriverSetting);
router.post('/v1/feedback/:driver_id', DriverController.writeFeedback);
router.put('/v1/broken-bus/:driver_id', DriverController.reportBrokenBus);

// router.put('/change-password/:driver_id', DriverController.updateDriverProfile);
// router.put('/avatar/:driver_id', upload.single('avatar'), DriverController.uploadAvatar);

export default router;
