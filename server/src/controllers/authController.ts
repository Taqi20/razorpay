import { Request, Response } from "express";
import { prisma } from "../db";
import { useOtpProvider } from "../utils/otpProvider";
import { signJwt } from "../utils/jwt";

export async function sendOtpHandler(req: Request, res: Response) {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({
                error: 'Phone number is required'
            });
        }

        const cleanPhone = phone.replace(/\s+/g, '');

        const provider = process.env.OTP_PROVIDER_NAME || 'mock';
        const result = await useOtpProvider(provider, cleanPhone);

        return res.json({
            ok: true, provider, ...(provider === 'mock' ? {
                code: result
            } : {})
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({
            error: err.message || 'Internal error'
        });
    }
}

export async function verifyOtpHandler(req: Request, res: Response) {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({
                error: 'phone and code required'
            });
        }

        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
            return res.status(400).json({
                error: 'no such user'
            });
        }

        const otp = await prisma.otp.findFirst({
            where: {
                userId: user.id,
                code,
                used: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otp) return res.status(400).json({
            error: 'invalid or expired code'
        });

        await prisma.otp.update({
            where: { id: otp.id },
            data: { used: true }
        });

        const token = signJwt({ userId: user.id, phone: user.phone });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            ok: true,
            token
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({
            error: err.message || 'Internal error'
        });
    }
}