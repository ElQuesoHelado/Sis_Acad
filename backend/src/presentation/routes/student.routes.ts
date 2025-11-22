/**
 * @file Define las rutas API para el módulo de Estudiantes.
 * @description Todas las rutas aquí requieren autenticación JWT
 * y rol de 'estudiante'.
 */
import { Router } from "express";
import { expressjwt } from "express-jwt";
import { env } from "@/infraestructure/config/index.js";
import {
  ensureRole,
  loadStudentProfile,
} from "../middlewares/auth.middleware.js";
import {
  makeGetStudentCoursesController,
  makeGetStudentGradesController,
  makeGetStudentScheduleController,
  makeGetAvailableLabGroupsController,
  makeEnrollInLabGroupController,
  makeEnrollInLabGroupsController,
  makeGetCourseProgressController,
} from "../controllers/student.controller.js";
import { type AppContainer } from "../../container.js";
import { UserRole } from "@/domain/enums/user-role.enum.js";
import {
  validateGetStudentCourses,
  validateGetStudentGrades,
  validateGetStudentSchedule,
  validateGetAvailableLabGroups,
  validateEnrollInLabGroups,
  validateEnrollInLabGroup,
} from "../validation/student.validation.js";

/**
 * Factory para crear el router de estudiantes.
 * @param container - El contenedor de DI de la aplicación.
 */
export const createStudentRouter = (container: AppContainer): Router => {
  const router = Router();

  const authMiddleware = expressjwt({
    secret: env.JWT_SECRET,
    algorithms: ["HS256"],
  });
  const isStudent = ensureRole(UserRole.STUDENT);
  const loadProfile = loadStudentProfile(container.repositories.studentProfile);

  router.use(authMiddleware, isStudent, loadProfile);

  /**
   * @route GET /api/student/courses/{semester}
   * @summary Obtener cursos matriculados por semestre.
   * @description Devuelve la lista de cursos en los que el estudiante
   * (autenticado por JWT) está matriculado para un semestre específico.
   * @group Student - Operaciones del estudiante
   * @security bearerAuth
   *
   * @param {string} semester.path.required - El semestre académico.
   * @example semester "2024-I"
   *
   * @returns {StudentCourseDto[]} 200 - Lista de cursos matriculados.
   * @example response
   * [
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000001",
   * "courseCode": "01703239",
   * "courseName": "SISTEMAS OPERATIVOS",
   * "credits": 4,
   * "professorName": "Wilber Roberto Ramos Lovon",
   * "labStatus": "Sin Matricula"
   * },
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000002",
   * "courseCode": "01703237",
   * "courseName": "INGENIERIA DE SOFTWARE II",
   * "credits": 4,
   * "professorName": "Eliana Maria Adriazola Herrera",
   * "labStatus": "Sin Matricula"
   * }
   * ]
   *
   * @returns {ErrorResponse} 400 - Formato de semestre inválido.
   * @returns {ErrorResponse} 401 - No autorizado (token inválido o expirado).
   * @returns {ErrorResponse} 403 - Forbidden (no es estudiante o no tiene perfil).
   */
  router.get(
    "/courses/:semester",
    validateGetStudentCourses, // Valida el formato del semestre
    makeGetStudentCoursesController(container.useCases.getStudentCourses),
  );

  /**
   * @route GET /api/student/grades/{semester}
   * @summary Obtener notas del estudiante por semestre.
   * @description Devuelve las notas, promedio y estado de cada curso
   * matriculado en un semestre.
   * @group Student - Operaciones del estudiante
   * @security bearerAuth
   *
   * @param {string} semester.path.required - El semestre académico.
   * @example semester "2024-I"
   *
   * @returns {StudentCourseGradesDto[]} 200 - Resumen de notas por curso.
   * @example response
   * [
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000001",
   * "courseName": "SISTEMAS OPERATIVOS",
   * "professorName": "Wilber Roberto Ramos Lovon",
   * "grades": [
   * { "id": "00000000-000a-4000-8000-000000000001", "type": "parcial_1", "typeName": "Parcial 1", "score": 15 },
   * { "id": "00000000-000a-4000-8000-000000000002", "type": "continua_1", "typeName": "Continua 1", "score": 18 }
   * ],
   * "average": 5.1,
   * "status": "En Progreso"
   * }
   * ]
   *
   * @returns {ErrorResponse} 400 - Formato de semestre inválido.
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden.
   */
  router.get(
    "/grades/:semester",
    validateGetStudentGrades,
    makeGetStudentGradesController(container.useCases.getStudentGrades),
  );

  /**
   * @route GET /api/student/schedule/{semester}
   * @summary Obtener horario del estudiante por semestre.
   * @description Devuelve el horario de clases (teoría y laboratorios
   * matriculados) del estudiante.
   * @group Student - Operaciones del estudiante
   * @security bearerAuth
   *
   * @param {string} semester.path.required - El semestre académico.
   * @example semester "2024-I"
   *
   * @returns {StudentScheduleEntryDto[]} 200 - Lista de entradas de horario.
   * @example response
   * [
   * {
   * "courseName": "SISTEMAS OPERATIVOS",
   * "groupType": "Teoria",
   * "groupLetter": "A",
   * "day": "LUNES",
   * "startTime": "10:00",
   * "endTime": "10:50",
   * "classroomName": "Aula 101",
   * "professorName": "Wilber Roberto Ramos Lovon"
   * }
   * ]
   *
   * @returns {ErrorResponse} 400 - Formato de semestre inválido.
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden.
   */
  router.get(
    "/schedule/:semester",
    validateGetStudentSchedule,
    makeGetStudentScheduleController(container.useCases.getStudentSchedule),
  );

  /**
   * @route GET /api/student/enrollment/{enrollmentId}/available-labs
   * @summary Obtener laboratorios disponibles para una matrícula.
   * @description Devuelve los laboratorios (del mismo curso) que
   * aún tienen capacidad.
   * @group Student - Operaciones del estudiante
   * @security bearerAuth
   *
   * @param {string} enrollmentId.path.required - ID de la matrícula de teoría.
   * @example enrollmentId "00000000-0009-4000-8000-000000000001"
   *
   * @returns {AvailableLabGroupDto[]} 200 - Lista de laboratorios disponibles.
   * @example response
   * [
   * {
   * "id": "00000000-0007-4000-8000-000000000001",
   * "groupLetter": "A",
   * "capacity": 20,
   * "currentEnrollment": 0,
   * "isFull": false
   * },
   * {
   * "id": "00000000-0007-4000-8000-000000000002",
   * "groupLetter": "B",
   * "capacity": 20,
   * "currentEnrollment": 0,
   * "isFull": false
   * }
   * ]
   *
   * @returns {ErrorResponse} 400 - ID de matrícula inválido.
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden (no es dueño de la matrícula).
   * @returns {ErrorResponse} 404 - Matrícula no encontrada.
   */
  router.get(
    "/enrollment/:enrollmentId/available-labs",
    validateGetAvailableLabGroups,
    makeGetAvailableLabGroupsController(
      container.useCases.getAvailableLabGroups,
    ),
  );

  /**
   * @route POST /api/student/enroll-labs
   * @summary Matrícula masiva en laboratorios (Transaccional).
   * @description Matricula al estudiante en múltiples grupos de laboratorio
   * en una sola transacción. Si uno falla, todos fallan (rollback).
   * @group Student - Operaciones del estudiante
   * @security bearerAuth
   *
   * @requestBody {EnrollInLabGroupsInput}
   * @example request
   * {
   * "selections": [
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000001",
   * "labGroupId": "00000000-0007-4000-8000-000000000001"
   * },
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000002",
   * "labGroupId": "00000000-0007-4000-8000-000000000003"
   * }
   * ]
   * }
   *
   * @returns {object} 200 - Matrícula exitosa.
   * @example response
   * {
   * "success": true,
   * "message": "Successfully enrolled in all selected lab groups."
   * }
   *
   * @returns {ErrorResponse} 409 - Conflicto (ej. un grupo está lleno,
   * ya matriculado, o no corresponde al curso).
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden.
   */
  router.post(
    "/enroll-labs",
    validateEnrollInLabGroups,
    makeEnrollInLabGroupsController(container.useCases.enrollInLabGroups),
  );

  /**
   * @route PATCH /api/student/enroll-lab
   * @summary Matrícula en un solo laboratorio (Transaccional).
   * @description Matricula al estudiante en un único grupo de laboratorio.
   * @group Student - Operaciones del estudiante
   * @security bearerAuth
   *
   * @requestBody {EnrollInLabGroupInput}
   * @example request
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000001",
   * "labGroupId": "00000000-0007-4000-8000-000000000001"
   * }
   *
   * @returns {object} 200 - Matrícula exitosa.
   * @example response
   * {
   * "success": true,
   * "message": "Successfully enrolled in lab group."
   * }
   *
   * @returns {ErrorResponse} 409 - Conflicto (grupo lleno, ya matriculado, etc.)
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden.
   */
  router.patch(
    "/enroll-lab",
    validateEnrollInLabGroup,
    makeEnrollInLabGroupController(container.useCases.enrollInLabGroup),
  );


  router.get(
  "/enrollment/:enrollmentId/syllabus",
   makeGetCourseProgressController(container.useCases.getStudentCourseProgress)
);

  return router;
};
