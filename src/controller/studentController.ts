import { Request, Response } from 'express';
import { StudentService } from '../service/studentService';

export class StudentController {
  private studentService: StudentService;

  constructor() {
    this.studentService = new StudentService();
  }

  getStudentSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cui } = req.params;

      if (!cui) {
        res.status(400).json({
          success: false,
          message: 'El parámetro CUI es requerido'
        });
        return;
      }

      const cuiNumber = parseInt(cui, 10);
      if (isNaN(cuiNumber)) {
        res.status(400).json({
          success: false,
          message: 'El CUI debe ser un número válido'
        });
        return;
      }

      const schedule = await this.studentService.getStudentSchedule(cuiNumber);

      res.status(200).json({
        success: true,
        data: schedule,
        message: 'Horario obtenido exitosamente'
      });

    } catch (error) {
      console.error('Error en getStudentSchedule:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener el horario',
        error: error.message
      });
    }
  }

  getStudentCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cui } = req.params;

      if (!cui) {
        res.status(400).json({
          success: false,
          message: 'El parámetro CUI es requerido'
        });
        return;
      }

      const cuiNumber = parseInt(cui, 10);
      if (isNaN(cuiNumber)) {
        res.status(400).json({
          success: false,
          message: 'El CUI debe ser un número válido'
        });
        return;
      }

      const courses = await this.studentService.getStudentCourses(cuiNumber);

      if (!courses || courses.length === 0) {
        res.status(404).json({
          success: true,
          data: [],
          message: 'El estudiante no está matriculado en ningún curso'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length,
        message: 'Cursos obtenidos exitosamente'
      });

    } catch (error) {
      console.error('Error en getStudentCourses:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener los cursos'
      });
    }
  }
}
