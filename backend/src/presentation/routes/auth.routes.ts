import { Router } from "express";
import { type AppContainer } from "../../container.js";
import { makeLoginController } from "../controllers/auth.controller.js";
import { validateLogin } from "../validation/auth.validation.js";

export const createAuthRouter = (container: AppContainer): Router => {
  const router = Router();

  /**
   * @route POST /api/auth/login
   * @summary Inicia sesión para un usuario (estudiante o profesor).
   * @description Autentica al usuario usando email y contraseña. Devuelve un
   * token JWT y la información básica del rol y perfil del usuario.
   * @group Auth - Operaciones de autenticación
   *
   * @requestBody
   * {
   * "email": "usuario@unsa.edu.pe",
   * "password": "password123"
   * }
   *
   * @example request (Estudiante)
   * {
   * "email": "atorresa@unsa.edu.pe",
   * "password": "password123"
   * }
   *
   * @example request (Profesor)
   * {
   * "email": "wramos@unsa.edu.pe",
   * "password": "password123"
   * }
   *
   * @returns {LoginOutputDto} 200 - Autenticación exitosa.
   * @example response (Estudiante)
   * {
   * "token": "eyJhbGciOiJIUzI1NiI...",
   * "role": "estudiante",
   * "profileId": "00000000-0003-4000-8000-000000000001"
   * }
   *
   * @returns {ErrorResponse} 400 - Error de validación (ej. email inválido, password corto).
   * @returns {ErrorResponse} 401 - No autorizado (credenciales incorrectas).
   */
  router.post(
    "/login",
    validateLogin,
    makeLoginController(container.useCases.login),
  );

  return router;
};
