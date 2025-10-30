import { authenticator } from 'otplib';

export type MfaSecret = {
  otpauthUrl: string;
  secret: string;
};

export const generateMfaSecret = (user: { id: string; username: string }, issuer: string): MfaSecret => {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(user.username, issuer, secret);
  return { secret, otpauthUrl };
};

export const verifyToken = (token: string, secret: string): boolean => {
  return authenticator.verify({ token, secret });
};
