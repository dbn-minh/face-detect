import express from 'express';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();

router.post('/v1/signup', AuthController.signup);
router.post('/v1/login', AuthController.login);
router.post('/v1/logout', AuthController.logout);
router.post('/v1/refresh-token', AuthController.refreshToken);
// change password

export default router;
