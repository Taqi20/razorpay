import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { prisma } from '../db';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).user.userId as string;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                name: true,
                createdAt: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                },
                subscriptions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!user) return res.status(404).json({
            error: 'user not found'
        });

        return res.json({
            ok: true,
            user
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({
            error: err.message || 'internal'
        });
    }
});

export default router;
