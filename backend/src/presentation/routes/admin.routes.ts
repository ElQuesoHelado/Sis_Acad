import { Router } from "express";
import { expressjwt } from "express-jwt";
import { env } from "@/infraestructure/config/index.js";
import { type AppContainer } from "../../container.js";
import { ensureRole } from "../middlewares/auth.middleware.js";
import { UserRole } from "@/domain/enums/user-role.enum.js";
import { makeGetAdminStudentDetailsController, makeGetAdminTeacherDetailsController, makeGetAllUsersController } from "../controllers/admin.controller.js";
import z from "zod";
import { validate } from "../middlewares/validation.middleware.js";


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

  router.use(authMiddleware, ensureRole(UserRole.ADMIN));

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

  return router;
};
