import bcrypt from 'bcrypt';
import { userRepository } from '../models/user.repository';
import { SafeUser } from '../models/user.model';
import { TokenService } from './token.service';

interface LoginResult {
  token: string;
  user: SafeUser;
}

/**
 * Capa de servicio: contiene la LÓGICA DE NEGOCIO del login.
 * El controller solo la invoca; no valida contraseñas ni arma el token aquí.
 */
export class AuthService {
  static async login(email: string, password: string): Promise<LoginResult> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error('CREDENTIALS_INVALID');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error('CREDENTIALS_INVALID');
    }

    const token = TokenService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Nunca devolvemos el password, ni siquiera el hash.
    const { password: _password, ...safeUser } = user;

    return { token, user: safeUser };
  }
}
