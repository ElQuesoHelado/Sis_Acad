import { Router, type Request, type Response, type NextFunction } from "express";
import { expressjwt } from "express-jwt";
import { env } from "@/infraestructure/config/index.js";
import { type AppContainer } from "../../container.js";
import { ensureRole } from "../middlewares/auth.middleware.js";
import { UserRole } from "@/domain/enums/user-role.enum.js";
import { makeGetAdminStudentDetailsController, makeGetAdminTeacherDetailsController } from "../controllers/admin.controller.js";
import { makeGetStudentAttendanceReportController } from "../controllers/student.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import z from "zod";
import type { GetAllUsersUseCase } from "@/application/use-cases/admin/get-all-users.usecase.js";

const detailsSchema = z.object({
  params: z.object({
    userId: z.uuid(),
    semester: z.string().regex(/^\d{4}-(I|II)$/),
  })
});

/**
 * Controlador auxiliar para filtrar usuarios por rol.
 * Reutiliza el caso de uso GetAllUsers pero filtra la respuesta.
 */
const makeGetUsersByRoleController = (useCase: GetAllUsersUseCase, roleToFilter: UserRole) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const allUsers = await useCase.execute();
      const filteredUsers = allUsers.filter(user => user.role === roleToFilter);
      return res.status(200).json(filteredUsers);
    } catch (error) {
      next(error);
    }
  };
};

export const createSecretaryRouter = (container: AppContainer): Router => {
  const router = Router();

  const authMiddleware = expressjwt({
    secret: env.JWT_SECRET,
    algorithms: ["HS256"],
  });

  router.use(authMiddleware, ensureRole(UserRole.SECRETARY));

  /**
   * @route GET /api/secretary/students
   * @summary Obtener listado de estudiantes.
   */
  router.get(
    "/students",
    makeGetUsersByRoleController(container.useCases.getAllUsers, UserRole.STUDENT)
  );

  /**
   * @route GET /api/secretary/teachers
   * @summary Obtener listado de profesores.
   */
  router.get(
    "/teachers",
    makeGetUsersByRoleController(container.useCases.getAllUsers, UserRole.PROFESSOR)
  );

  /**
   * @route GET /api/secretary/students/{userId}/{semester}
   * @summary Ver detalles del estudiante (Cursos, Notas, Estado).
   */
  router.get(
    "/students/:userId/:semester",
    validate(detailsSchema),
    makeGetAdminStudentDetailsController(container.useCases.getAdminStudentDetails)
  );

  /**
   * @route GET /api/secretary/teachers/{userId}/{semester}
   * @summary Ver carga académica del profesor (Cursos, Horario).
   */
  router.get(
    "/teachers/:userId/:semester",
    validate(detailsSchema),
    makeGetAdminTeacherDetailsController(container.useCases.getAdminTeacherDetails)
  );

  /**
   * @route GET /api/secretary/attendance/{enrollmentId}
   * @summary Ver reporte detallado de asistencia de un alumno.
   */
  router.get(
    "/attendance/:enrollmentId",
    makeGetStudentAttendanceReportController(container.useCases.getStudentAttendanceReport)
  );

  return router;
};
