import { Router } from "express";
import { expressjwt } from "express-jwt";
import { env } from "@/infraestructure/config/index.js";
import { type AppContainer } from "../../container.js";
import { makeGetAllClassroomsController } from "../controllers/classroom.controller.js";

/**
 * Crea el router para las rutas de /classrooms.
 * @param container - El contenedor de DI.
 * @returns El router de Express.
 */
export const createClassroomRouter = (container: AppContainer): Router => {
  const router = Router();

  // Middleware de autenticación JWT requerido para todas las rutas
  const authMiddleware = expressjwt({
    secret: env.JWT_SECRET,
    algorithms: ["HS256"],
  });

  router.use(authMiddleware);

  /**
   * @route GET /api/classrooms
   * @summary Obtener la lista de todos los salones.
   * @description Devuelve una lista de todos los salones (aulas y laboratorios)
   * disponibles en el sistema para ser usados en selectores.
   * @group Classroom - Operaciones de Salones
   * @security bearerAuth
   *
   * @returns {ClassroomDto[]} 200 - Lista de salones.
   * @example response
   * [
   * {
   * "id": "00000000-0005-4000-8000-000000000004",
   * "name": "Aula 101",
   * "type": "teoria",
   * "capacity": 40
   * },
   * {
   * "id": "00000000-0005-4000-8000-000000000001",
   * "name": "Lab 1",
   * "type": "labo",
   * "capacity": 20
   * }
   * ]
   *
   * @returns {ErrorResponse} 401 - No autorizado.
   */
  router.get(
    "/",
    makeGetAllClassroomsController(container.useCases.getAllClassrooms),
  );

  return router;
};
