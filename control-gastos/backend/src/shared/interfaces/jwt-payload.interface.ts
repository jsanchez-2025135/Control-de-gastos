/**
 * Forma del contenido (payload) que viaja dentro del token JWT.
 */
export interface JwtPayload {
  sub: string;      // id del usuario
  email: string;
  role: 'admin' | 'user';
}
