/**
 * @file Define las rutas API para el módulo de Profesores.
 * @description Todas las rutas aquí requieren autenticación JWT
 * y rol de 'profesor'.
 */
import { Router } from "express";
import { expressjwt } from "express-jwt";
import { env } from "@/infraestructure/config/index.js";
import {
  ensureRole,
  loadTeacherProfile,
} from "../middlewares/auth.middleware.js";
import { type AppContainer } from "../../container.js";
import { UserRole } from "@/domain/enums/user-role.enum.js";
import {
  makeGetStudentRosterController,
  makeGetStudentRosterWithGradesController,
  makeGetTeacherGroupsController,
  makeGetTeacherScheduleController,
  makeSaveBulkGradesController,
  makeTakeAttendanceController,
} from "../controllers/teacher.controller.js";
import {
  validateGetTeacherGroups,
  validateGetTeacherSchedule,
  validateGetStudentRoster,
  validateTakeAttendance,
  validateGetRosterWithGrades,
  validateSaveBulkGrades,
} from "../validation/teacher.validation.js";

export const createTeacherRouter = (container: AppContainer): Router => {
  const router = Router();

  const authMiddleware = expressjwt({
    secret: env.JWT_SECRET,
    algorithms: ["HS256"],
  });
  const isTeacher = ensureRole(UserRole.PROFESSOR);
  const loadProfile = loadTeacherProfile(container.repositories.teacherProfile);

  router.use(authMiddleware, isTeacher, loadProfile);

  /**
   * @route GET /api/teacher/groups/{semester}
   * @summary Obtener los grupos (cursos) asignados al profesor.
   * @description Devuelve la lista de grupos de teoría y laboratorio
   * asignados al profesor (autenticado por JWT) en un semestre.
   * @group Teacher - Operaciones del profesor
   * @security bearerAuth
   *
   * @param {string} semester.path.required - El semestre académico.
   * @example semester "2024-I"
   *
   * @returns {TeacherGroupDto[]} 200 - Lista de grupos asignados.
   * @example response
   * [
   * {
   * "groupId": "00000000-0006-4000-8000-000000000001",
   * "courseName": "SISTEMAS OPERATIVOS",
   * "groupType": "teoria",
   * "groupLetter": "A"
   * },
   * {
   * "groupId": "00000000-0007-4000-8000-000000000001",
   * "courseName": "SISTEMAS OPERATIVOS",
   * "groupType": "labo",
   * "groupLetter": "A"
   * }
   * ]
   *
   * @returns {ErrorResponse} 400 - Formato de semestre inválido.
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden (no es profesor).
   */
  router.get(
    "/groups/:semester",
    validateGetTeacherGroups,
    makeGetTeacherGroupsController(container.useCases.getTeacherGroups),
  );

  /**
   * @route GET /api/teacher/schedule/{semester}
   * @summary Obtener el horario del profesor.
   * @description Devuelve el horario semanal de clases del profesor.
   * @group Teacher - Operaciones del profesor
   * @security bearerAuth
   *
   * @param {string} semester.path.required - El semestre académico.
   * @example semester "2024-I"
   *
   * @returns {TeacherScheduleEntryDto[]} 200 - Lista de entradas de horario.
   * @example response
   * [
   * {
   * "courseName": "SISTEMAS OPERATIVOS",
   * "groupType": "Teoria",
   * "groupLetter": "A",
   * "day": "LUNES",
   * "startTime": "10:00",
   * "endTime": "10:50",
   * "classroomName": "Aula 101"
   * },
   * {
   * "courseName": "SISTEMAS OPERATIVOS",
   * "groupType": "Labo",
   * "groupLetter": "A",
   * "day": "LUNES",
   * "startTime": "14:00",
   * "endTime": "14:50",
   * "classroomName": "Lab 1"
   * }
   * ]
   *
   * @returns {ErrorResponse} 400 - Formato de semestre inválido.
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden.
   */
  router.get(
    "/schedule/:semester",
    validateGetTeacherSchedule,
    makeGetTeacherScheduleController(container.useCases.getTeacherSchedule),
  );

  /**
   * @route GET /api/teacher/group/{groupId}/roster
   * @summary Obtener lista de estudiantes (Roster).
   * @description Devuelve la lista de estudiantes matriculados en un grupo
   * (teoría o lab) específico.
   * @group Teacher - Operaciones del profesor
   * @security bearerAuth
   *
   * @param {string} groupId.path.required - ID del grupo (TheoryGroup o LabGroup).
   * @example groupId "00000000-0006-4000-8000-000000000001"
   *
   * @param {string} type.query.required - Tipo de grupo ('teoria' o 'labo').
   * @example type "teoria"
   *
   * @returns {StudentRosterDto[]} 200 - Lista de estudiantes.
   * @example response
   * [
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000001",
   * "studentCode": "20233585",
   * "name": "Alvaro Sebastian",
   * "surname": "Torres Ara",
   * "email": "atorresa@unsa.edu.pe"
   * }
   * ]
   *
   * @returns {ErrorResponse} 400 - Validación fallida (UUID o tipo).
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden (no es profesor de este grupo).
   */
  router.get(
    "/group/:groupId/roster",
    validateGetStudentRoster,
    makeGetStudentRosterController(container.useCases.getStudentRoster),
  );

  /**
   * @route POST /api/teacher/attendance/take
   * @summary Registrar asistencia (Transaccional).
   * @description Registra o actualiza la asistencia para una lista de
   * estudiantes en una fecha y grupo específicos.
   * @group Teacher - Operaciones del profesor
   * @security bearerAuth
   *
   * @requestBody {TakeAttendanceDto}
   * @example request
   * {
   * "classType": "teoria",
   * "groupId": "00000000-0006-4000-8000-000000000001",
   * "date": "2024-05-20",
   * "records": [
   * { "enrollmentId": "00000000-0009-4000-8000-000000000001", "status": "presente" },
   * { "enrollmentId": "00000000-0009-4000-8000-000000000007", "status": "ausente" }
   * ]
   * }
   *
   * @returns {object} 200 - Asistencia registrada.
   * @example response
   * { "success": true, "message": "Attendance recorded successfully." }
   *
   * @returns {ErrorResponse} 400 - Validación fallida (ej. fecha futura).
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden (no es profesor del grupo).
   */
  router.post(
    "/attendance/take",
    validateTakeAttendance,
    makeTakeAttendanceController(container.useCases.takeAttendance),
  );

  /**
   * @route GET /api/teacher/group/{groupId}/roster-with-grades
   * @summary Obtener lista de estudiantes con todas sus notas.
   * @description Devuelve la lista de estudiantes con una grilla de todas
   * sus notas (parciales y continuas).
   * @group Teacher - Operaciones del profesor
   * @security bearerAuth
   *
   * @param {string} groupId.path.required - ID del grupo (TheoryGroup o LabGroup).
   * @example groupId "00000000-0006-4000-8000-000000000001"
   *
   * @param {string} type.query.required - Tipo de grupo ('teoria' o 'labo').
   * @example type "teoria"
   *
   * @returns {StudentRosterWithGradesDto[]} 200 - Lista de estudiantes con notas.
   * @example response
   * [
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000001",
   * "studentCode": "20233585",
   * "name": "Alvaro Sebastian",
   * "surname": "Torres Ara",
   * "email": "atorresa@unsa.edu.pe",
   * "grades": [
   * { "type": "parcial_1", "score": 15 },
   * { "type": "parcial_2", "score": null },
   * { "type": "parcial_3", "score": null },
   * { "type": "continua_1", "score": 18 },
   * { "type": "continua_2", "score": null },
   * { "type": "continua_3", "score": null }
   * ]
   * }
   * ]
   *
   * @returns {ErrorResponse} 400 - Validación fallida.
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden.
   */
  router.get(
    "/group/:groupId/roster-with-grades",
    validateGetRosterWithGrades,
    makeGetStudentRosterWithGradesController(
      container.useCases.getStudentRosterWithGrades,
    ),
  );

  /**
   * @route POST /api/teacher/grades/save-bulk
   * @summary Guardar notas masivamente (Transaccional).
   * @description Guarda (o actualiza) un lote de notas para múltiples
   * estudiantes en una sola transacción.
   * @group Teacher - Operaciones del profesor
   * @security bearerAuth
   *
   * @requestBody {SaveBulkGradesDto}
   * @example request
   * {
   * "classType": "teoria",
   * "groupId": "00000000-0006-4000-8000-000000000001",
   * "entries": [
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000001",
   * "type": "parcial_2",
   * "score": 16
   * },
   * {
   * "enrollmentId": "00000000-0009-4000-8000-000000000007",
   * "type": "parcial_2",
   * "score": 13.5
   * }
   * ]
   * }
   *
   * @returns {object} 200 - Notas guardadas.
   * @example response
   * { "success": true, "message": "Grades saved successfully." }
   *
   * @returns {ErrorResponse} 400 - Validación fallida (ej. nota > 20).
   * @returns {ErrorResponse} 401 - No autorizado.
   * @returns {ErrorResponse} 403 - Forbidden.
   */
  router.post(
    "/grades/save-bulk",
    validateSaveBulkGrades,
    makeSaveBulkGradesController(container.useCases.saveBulkGrades),
  );

  return router;
};
