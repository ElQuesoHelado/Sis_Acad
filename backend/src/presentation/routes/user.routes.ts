import { Router } from "express";
import { expressjwt } from "express-jwt";
import { env } from "@/infraestructure/config/index.js";
import { type AppContainer } from "../../container.js";
import { makeGetUserProfileController } from "../controllers/user.controller.js";

/**
 * Crea el router para las rutas genéricas de usuario (ej. /profile).
 * @param container - El contenedor de DI.
 * @returns El router de Express.
 */
export const createUserRouter = (container: AppContainer): Router => {
  const router = Router();

  // Middleware de autenticación JWT requerido para todas las rutas en este archivo
  const authMiddleware = expressjwt({
    secret: env.JWT_SECRET,
    algorithms: ["HS256"],
  });

  router.use(authMiddleware);

  /**
   * @route GET /api/user/profile
   * @summary Obtener el perfil del usuario autenticado.
   * @description Devuelve el nombre, apellido, email y rol
   * del usuario actualmente autenticado (estudiante o profesor).
   * @group User - Operaciones de Usuario
   * @security bearerAuth
   *
   * @returns {UserProfileDto} 200 - Perfil del usuario.
   * @example response
   * {
   * "name": "Alvaro Sebastian",
   * "surname": "Torres Ara",
   * "email": "atorresa@unsa.edu.pe",
   * "role": "estudiante"
   * }
   *
   * @returns {ErrorResponse} 401 - No autorizado (token inválido o expirado).
   * @returns {ErrorResponse} 404 - Usuario no encontrado en la BD.
   */
  router.get(
    "/profile",
    makeGetUserProfileController(container.useCases.getUserProfile),
  );

  return router;
};
