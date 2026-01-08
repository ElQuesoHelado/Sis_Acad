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
import { makeCreateLabGroupController, makeGetAllLabGroupsController, makeUpdateLabGroupCapacityController, makeGetAllCoursesController, makeGetStudentsInLabController, makeSetEnrollmentPeriodController, makeGetEnrollmentPeriodController, makeSetDeadlineController, makeGetDeadlineController } from "../controllers/secretary.controller.js";
import { makeGetClassroomScheduleController } from "../controllers/classroom.controller.js";

const detailsSchema = z.object({
  params: z.object({
    userId: z.uuid(),
    semester: z.string().regex(/^\d{4}-(I|II)$/),
  })
});

const createLabSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    professorId: z.string().uuid(),
    groupLetter: z.string().length(1),
    capacity: z.coerce.number().int().positive().max(50),
    semester: z.string().regex(/^\d{4}-(I|II)$/, "Semester must be in format YYYY-I or YYYY-II"),
    schedules: z.array(
      z.object({
        day: z.enum(["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]),
        startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:MM format"),
        endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:MM format"),
        classroomId: z.string().uuid()
      })
    ).min(1, "At least one schedule must be provided")
  })
});

const enrollmentPeriodSchema = z.object({
  body: z.object({
    period: z.object({
      startDate: z.string().datetime({ message: "startDate debe ser formato ISO 8601 válido" }),
      endDate: z.string().datetime({ message: "endDate debe ser formato ISO 8601 válido" })
    })
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



  // --- GESTIÓN DE LABORATORIOS ---

  router.post(
    "/labs",
    validate(createLabSchema),
    makeCreateLabGroupController(container.useCases.createLabGroup)
  );

  router.get(
    "/labs",
    makeGetAllLabGroupsController(container.useCases.getAllLabGroups)
  );

  // Endpoint para obtener estudiantes matriculados en un laboratorio específico
  router.get(
    "/labs/:labGroupId/students",
    validate(z.object({
      params: z.object({
        labGroupId: z.string().uuid("labGroupId must be a valid UUID")
      })
    })),
    makeGetStudentsInLabController(container.useCases.getStudentsInLab)
  );

  // --- GESTIÓN DE PLAZOS DE INSCRIPCIÓN (Periodo completo) ---

  router.post(
    "/enrollment-period",
    validate(enrollmentPeriodSchema),
    makeSetEnrollmentPeriodController(container.useCases.manageEnrollmentDeadline)
  );

  router.get(
    "/enrollment-period",
    makeGetEnrollmentPeriodController(container.useCases.manageEnrollmentDeadline)
  );

  // --- ACTUALIZACIÓN DE CAPACIDAD DE LABORATORIO ---

  router.put(
    "/labs/:labGroupId/capacity",
    validate(z.object({
      params: z.object({
        labGroupId: z.string().uuid()
      }),
      body: z.object({
        newCapacity: z.coerce.number().int().positive().max(50)
      })
    })),
    makeUpdateLabGroupCapacityController(container.useCases.updateLabGroupCapacity)
  );

  // --- OBTENCIÓN DE CURSOS (para selects de formularios) ---

  router.get(
    "/courses",
    makeGetAllCoursesController(container.useCases.getAllCourses)
  );

  // --- GESTIÓN DE PLAZOS DE INSCRIPCIÓN (Legacy - mantener backwards compatibility) ---
  //
  // const deadlineSchema = z.object({
  //   body: z.object({
  //     deadline: z.string().datetime({ message: "Debe ser formato ISO 8601 válido" })
  //   })
  // });

  // router.post(
  //   "/enrollment-deadline",
  //   validate(deadlineSchema),
  //   makeSetDeadlineController(container.useCases.manageEnrollmentDeadline)
  // );
  //
  // router.get(
  //   "/enrollment-deadline",
  //   makeGetDeadlineController(container.useCases.manageEnrollmentDeadline)
  // );

  // --- VISUALIZACIÓN DE SALONES (CON RESERVAS) ---

  router.get(
    "/classrooms/:classroomId/schedule",
    makeGetClassroomScheduleController(container.useCases.getClassroomSchedule)
  );

  return router;
};
