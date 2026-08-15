import { AuthUser } from './user.model';

/** Forma exacta de lo que devuelve POST /api/auth/login */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}
