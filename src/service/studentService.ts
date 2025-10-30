import { AppDataSource } from "../data-source";
import { Enrollment } from "../entity/Enrollment";
import { ScheduleSlot } from "../entity/ScheduleSlot";
import { Student } from "../entity/Student";

export class StudentService {
  private studentRepository = AppDataSource.getRepository(Student);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private scheduleSlotRepository = AppDataSource.getRepository(ScheduleSlot);

  async getStudentSchedule(cui: number) {
    try {
      const schedule = await this.scheduleSlotRepository
        .createQueryBuilder('scheduleSlot')
        .innerJoinAndSelect('scheduleSlot.classroom', 'classroom')
        .innerJoin('enrollment', 'enrollment', 'enrollment.sectionId = scheduleSlot.ownerId')
        .innerJoin('enrollment.student', 'student')
        .where('student.cui = :cui', { cui })
        .select([
          'scheduleSlot.id',
          'scheduleSlot.dayOfWeek',
          'scheduleSlot.startTime',
          'scheduleSlot.endTime',
          'scheduleSlot.slotType',
          'classroom.name as classroomName',
          'classroom.ipAddress'
        ])
        .orderBy('scheduleSlot.dayOfWeek', 'ASC')
        .addOrderBy('scheduleSlot.startTime', 'ASC')
        .getMany();

      return schedule.map(slot => ({
        day: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        classroom: slot.classroom.name,
        type: slot.slotType,
        ipAddress: slot.classroom.ipAddress
      }));
    } catch (error) {
      throw new Error(`Error obteniendo horario: ${error.message}`);
    }

  }

  async getStudentCourses(cui: number) {
    try {
      const courses = await this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .innerJoinAndSelect('enrollment.student', 'student')
        .innerJoinAndSelect('enrollment.section', 'section')
        .innerJoinAndSelect('section.course', 'course')
        .innerJoinAndSelect('section.teacher', 'teacher')
        .where('student.cui = :cui', { cui })
        .select([
          'enrollment.enrollmentId',
          'course.id',
          'course.code',
          'course.name',
          'course.credits',
          'section.id',
          'section.sectionCode',
          'section.group',
          'teacher.id',
          'teacher.firstName',
          'teacher.lastName'
        ])
        .orderBy('course.name', 'ASC')
        .getMany();

      return courses;
    } catch (error) {
      throw new Error(`Error obteniendo cursos matriculados: ${error.message}`);
    }
  }
}
