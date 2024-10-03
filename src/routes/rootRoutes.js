import express from 'express';
import authRoutes from './authRoutes.js';
import parentRoutes from './parentRoutes.js';
import adminRoutes from './adminRoutes.js';
import driverRoutes from './driverRoutes.js';
import teacherRoutes from './teacherRoutes.js';

const router = express.Router();

// Set up route modules
router.use('/auth', authRoutes);
router.use('/parent', parentRoutes);
router.use('/teacher', teacherRoutes);
router.use('/admin', adminRoutes);
router.use('/driver', driverRoutes);

export default router;
