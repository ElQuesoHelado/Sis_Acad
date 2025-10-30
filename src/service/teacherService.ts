import { AppDataSource } from "../data-source";
import { Enrollment } from "../entity/Enrollment";
import { ScheduleSlot } from "../entity/ScheduleSlot";
import { Section } from "../entity/Section";
import { Student } from "../entity/Student";
import { Teacher } from "../entity/Teacher";

export class TeacherService {
  private teacherRepository = AppDataSource.getRepository(Teacher);
  private studentRepository = AppDataSource.getRepository(Student);
  private sectionRepository = AppDataSource.getRepository(Section);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private scheduleSlotRepository = AppDataSource.getRepository(ScheduleSlot);

  async getTeacherSchedule(teacherId: number) {
    return await this.sectionRepository
      .createQueryBuilder('section')
      .innerJoinAndSelect('section.teacher', 'teacher')
      .innerJoinAndSelect('section.course', 'course')
      .innerJoin(
        'schedule_slot',
        'scheduleSlot',
        'scheduleSlot.ownerId = section.id',
      )
      .innerJoinAndSelect('scheduleSlot.classroom', 'classroom')
      .where('teacher.id = :teacherId', { teacherId })
      .select([
        'section.id as sectionId',
        'section.sectionCode as sectionCode',
        'section.group as "group"',
        'course.id as courseId',
        'course.code as courseCode',
        'course.name as courseName',
        'scheduleSlot.id as slotId',
        'scheduleSlot.dayOfWeek as dayOfWeek',
        'scheduleSlot.startTime as startTime',
        'scheduleSlot.endTime as endTime',
        'scheduleSlot.slotType as slotType',
        'classroom.ipAddress as classroomIp',
        'classroom.name as classroomName'
      ])
      .orderBy('scheduleSlot.dayOfWeek', 'ASC')
      .addOrderBy('scheduleSlot.startTime', 'ASC')
      .getRawMany();
  }

  async getTeacherCourses(teacherId: number) {
    return await this.sectionRepository
      .createQueryBuilder('section')
      .innerJoinAndSelect('section.teacher', 'teacher')
      .innerJoinAndSelect('section.course', 'course')
      .where('teacher.id = :teacherId', { teacherId })
      .select([
        'section.id',
        'section.sectionCode',
        'section.group',
        'course.id',
        'course.code',
        'course.name',
        'course.credits',
      ])
      .orderBy('course.name', 'ASC')
      .getMany();
  }
}
