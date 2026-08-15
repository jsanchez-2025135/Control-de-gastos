/**
 * Contrato genérico de repositorio.
 * Cualquier fuente de datos (mock en memoria HOY, PostgreSQL MAÑANA) debe
 * implementar esta interfaz. Así el "service" nunca sabe si los datos vienen
 * de un arreglo o de una tabla SQL: solo conoce este contrato.
 */
export interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
}
