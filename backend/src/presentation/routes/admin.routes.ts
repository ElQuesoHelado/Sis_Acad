import { Router } from "express";
import { expressjwt } from "express-jwt";
import { env } from "@/infraestructure/config/index.js";
import { type AppContainer } from "../../container.js";
import { ensureRoles } from "../middlewares/auth.middleware.js";
import { UserRole } from "@/domain/enums/user-role.enum.js";
import { makeGetAdminStudentDetailsController, makeGetAdminTeacherDetailsController, makeGetAllUsersController } from "../controllers/admin.controller.js";
import z from "zod";
import { validate } from "../middlewares/validation.middleware.js";
import { makeGetAllLabGroupsWithSchedulesController } from "../controllers/admin.controller.js";
import { makeGetAllClassroomsController, makeGetClassroomScheduleController } from "../controllers/classroom.controller.js";


const detailsSchema = z.object({
  params: z.object({
    userId: z.uuid(),
    semester: z.string().regex(/^\d{4}-(I|II)$/),
  })
});

export const createAdminRouter = (container: AppContainer): Router => {
  const router = Router();

  const authMiddleware = expressjwt({
    secret: env.JWT_SECRET,
    algorithms: ["HS256"],
  });

  router.use(authMiddleware, ensureRoles([UserRole.ADMIN, UserRole.SECRETARY]));

  /**
   * @route GET /api/admin/users
   * @summary Obtener listado global de usuarios.
   * @description Retorna todos los usuarios registrados (profesores, alumnos, etc).
   * @group Admin
   */
  router.get(
    "/users",
    makeGetAllUsersController(container.useCases.getAllUsers)
  );

  /**
   * @route GET /api/admin/teachers/{userId}/{semester}
   * @summary Ver carga académica de un profesor.
   */
  router.get(
    "/teachers/:userId/:semester",
    validate(detailsSchema),
    makeGetAdminTeacherDetailsController(container.useCases.getAdminTeacherDetails)
  );

  /**
   * @route GET /api/admin/students/{userId}/{semester}
   * @summary Ver notas y cursos de un estudiante.
   */
  router.get(
    "/students/:userId/:semester",
    validate(detailsSchema),
    makeGetAdminStudentDetailsController(container.useCases.getAdminStudentDetails)
  );

  /**
   * @route GET /api/admin/lab-groups-with-schedules
   * @summary Ver todos los laboratorios con sus horarios
   * @description Obtiene la lista de todos los grupos de laboratorio con su información detallada incluyendo horarios
   * @group Admin - Laboratorios
   * @security bearerAuth
   *
   * @returns {LabGroupWithScheduleDto[]} 200 - Lista de laboratorios con horarios
   * @returns {ErrorResponse} 401 - No autorizado
   */
  router.get(
    "/lab-groups-with-schedules",
    makeGetAllLabGroupsWithSchedulesController(container.useCases.getAllLabGroupsWithSchedules)
  );

  /**
   * @route GET /api/admin/classrooms
   * @summary Ver todos los salones (aulas y laboratorios)
   * @description Obtiene la lista de todos los salones del sistema
   * @group Admin - Salones
   * @security bearerAuth
   *
   * @returns {ClassroomDto[]} 200 - Lista de salones
   * @returns {ErrorResponse} 401 - No autorizado
   */
  router.get(
    "/classrooms",
    makeGetAllClassroomsController(container.useCases.getAllClassrooms)
  );

  /**
   * @route GET /api/admin/classrooms/{classroomId}/schedule
   * @summary Ver horario de un salón con sus reservas
   * @description Obtiene el horario de un salón específico incluyendo clases programadas y reservas
   * @group Admin - Salones
   * @security bearerAuth
   *
   * @param {string} classroomId.path.required - ID del salón
   * @param {string} semester.query.required - Semestre (e.g., 2024-I)
   * @returns {ClassroomScheduleDto[]} 200 - Horario del salón
   * @returns {ErrorResponse} 400 - Semestre requerido
   * @returns {ErrorResponse} 401 - No autorizado
   * @returns {ErrorResponse} 404 - Salón no encontrado
   */
  router.get(
    "/classrooms/:classroomId/schedule",
    makeGetClassroomScheduleController(container.useCases.getClassroomSchedule)
  );

  return router;
};
