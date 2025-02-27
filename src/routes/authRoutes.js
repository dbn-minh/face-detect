import express from 'express';
import AuthController from '../controllers/authController.js';
import { verifyToken } from '../config/jwt.js';

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/reset-verification-token', AuthController.resetVerificationToken);
router.post('/verify-account', AuthController.verifyEmail);

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);

router.post('/forgot-password', AuthController.forgetPassword);
router.post('/reset-forgot-password-token', AuthController.resetVerificationToken);

router.post('/reset-password', AuthController.resetPassword);

router.post('/change-password',verifyToken, AuthController.changePassword);
router.post('/verify-code-number',AuthController.verifyResetOrVerificationToken);

export default router;
