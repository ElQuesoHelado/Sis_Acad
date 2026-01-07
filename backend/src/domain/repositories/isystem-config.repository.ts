export interface ISystemConfigRepository {
  // Guardar o actualizar una configuración (clave-valor)
  set(key: string, value: string): Promise<void>;
  // Obtener valor (ej: "2024-12-31")
  get(key: string): Promise<string | null>;
}
