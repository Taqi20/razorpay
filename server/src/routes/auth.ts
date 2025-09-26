import express from 'express';
import { sendOtpHandler, verifyOtpHandler } from '../controllers/authController';

const router = express.Router();

router.post('/send-otp', sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);

router.post('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    return res.json({
        ok: true
    });
});

export default router;
