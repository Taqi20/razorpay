import { prisma } from '../db';

const OTP_LENGTH = 6;
const DEFAULT_EXPIRY_MINUTES = 5;

export async function sendOtpDev(phone: string) {
    const code = (Math.floor(Math.random() * Math.pow(10, OTP_LENGTH)) + '').padStart(OTP_LENGTH, '0');
    const expiresAt = new Date(Date.now() + DEFAULT_EXPIRY_MINUTES * 60 * 1000);

    let user = await prisma.user.findUnique({
        where: {
            phone
        }
    });
    if (!user) {
        user = await prisma.user.create({
            data: {
                phone
            }
        });
    }

    await prisma.otp.create({
        data: {
            userId: user.id,
            code,
            expiresAt,
        },
    });

    console.log(`[MOCK OTP] phone=${phone} code=${code} (expires ${DEFAULT_EXPIRY_MINUTES}m)`);
    return { success: true, code }; // Reminder, to remove code when using twilio or firebase 
}

//TODO: check which provide would be feasible in terms of cost then keep it 
export async function sendOtpTwilio(phone: string) {
    throw new Error('Twilio provider not implemented. Provide credentials and ask to enable.');
}
export async function sendOtpFirebase(phone: string) {
    throw new Error('Firebase provider not implemented. Provide credentials and ask to enable.');
}

export async function useOtpProvider(name: string, phone: string) {
    if (name === 'mock') return sendOtpDev(phone);
    if (name === 'twilio') return sendOtpTwilio(phone);
    if (name === 'firebase') return sendOtpFirebase(phone);
    throw new Error('Invalid OTP provider name');
}
