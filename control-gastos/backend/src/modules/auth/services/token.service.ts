import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@config/env';
import { JwtPayload } from '@shared/interfaces/jwt-payload.interface';

/**
 * Encapsula todo lo relacionado a generación/verificación de JWT.
 * Nadie más en el proyecto debe llamar a "jsonwebtoken" directamente.
 */
export class TokenService {
  static generateToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.jwt.secret, options);
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwt.secret) as JwtPayload;
  }
}
