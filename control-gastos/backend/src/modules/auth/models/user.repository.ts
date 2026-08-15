import { User } from './user.model';
import { usersMock } from './user.mock';

/**
 * Repositorio de usuarios.
 *
 * HOY: implementación en memoria (mock).
 * MAÑANA: se crea una clase "PostgresUserRepository" que implemente la misma
 * interfaz "IUserRepository" pero consultando la tabla "users" vía pg/TypeORM/Prisma.
 * El AuthService (capa de servicio) solo depende de "IUserRepository", nunca
 * de la implementación concreta, así el cambio de mock -> PostgreSQL no lo toca.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export class InMemoryUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = usersMock.find((u) => u.email === email);
    return user ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const user = usersMock.find((u) => u.id === id);
    return user ?? null;
  }
}

// Instancia que se inyecta en el AuthService.
// Para pasar a PostgreSQL, este export es lo único que cambiaría:
// export const userRepository: IUserRepository = new PostgresUserRepository();
export const userRepository: IUserRepository = new InMemoryUserRepository();
