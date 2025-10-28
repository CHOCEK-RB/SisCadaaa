import jwt from 'jsonwebtoken';
import type { UserSession } from '$lib/store/auth.store';

export async function verifyToken(
  token: string,
  secret: string,
): Promise<UserSession> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      if (
        decoded &&
        typeof decoded === 'object' &&
        'sub' in decoded &&
        'email' in decoded &&
        'exp' in decoded
      ) {
        resolve(decoded as UserSession);
      } else {
        reject(new Error('Invalid token payload structure'));
      }
    });
  });
}
