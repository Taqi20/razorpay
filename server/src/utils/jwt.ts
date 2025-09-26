import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "test";
const JWT_EXPIRES_IN = '10d';
export function signJwt(payload: object) {
    return jwt.sign(
        payload,
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN
        }
    );
}

export function verifyJwt(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}
