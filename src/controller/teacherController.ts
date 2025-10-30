import { Request, Response } from 'express';
import { StudentService } from '../service/studentService';
import { TeacherService } from '../service/teacherService';

export class TeacherController {
  private teacherService: TeacherService;

  constructor() {
    this.teacherService = new TeacherService();
  }

  getTeacherSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { teacherId } = req.params;

      if (!teacherId) {
        res.status(400).json({
          success: false,
          message: 'El parámetro teacherId es requerido'
        });
        return;
      }

      const teacherIdNumber = parseInt(teacherId, 10);
      if (isNaN(teacherIdNumber)) {
        res.status(400).json({
          success: false,
          message: 'El teacherId debe ser un número válido'
        });
        return;
      }

      const schedule = await this.teacherService.getTeacherSchedule(teacherIdNumber);

      if (!schedule || schedule.length === 0) {
        res.status(404).json({
          success: true,
          data: [],
          message: 'No se encontraron horarios para el profesor'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: schedule,
        count: schedule.length,
        message: 'Horario del profesor obtenido exitosamente'
      });

    } catch (error) {
      console.error('Error en getTeacherSchedule:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener el horario del profesor'
      });
    }
  }

  getTeacherCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const { teacherId } = req.params;

      if (!teacherId) {
        res.status(400).json({
          success: false,
          message: 'El parámetro teacherId es requerido'
        });
        return;
      }

      const teacherIdNumber = parseInt(teacherId, 10);
      if (isNaN(teacherIdNumber)) {
        res.status(400).json({
          success: false,
          message: 'El teacherId debe ser un número válido'
        });
        return;
      }

      const courses = await this.teacherService.getTeacherCourses(teacherIdNumber);

      if (!courses || courses.length === 0) {
        res.status(404).json({
          success: true,
          data: [],
          message: 'El profesor no tiene cursos asignados'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length,
        message: 'Cursos del profesor obtenidos exitosamente'
      });

    } catch (error) {
      console.error('Error en getTeacherCourses:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener los cursos del profesor'
      });
    }
  }
}
