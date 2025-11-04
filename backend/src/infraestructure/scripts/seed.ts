import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import type { DataSource, Repository } from "typeorm";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import {
  UserModel,
  StudentProfileModel,
  TeacherProfileModel,
  CourseModel,
  ClassroomModel,
  TheoryGroupModel,
  LabGroupModel,
  ClassScheduleModel,
  EnrollmentModel,
  GradeModel,
  AttendanceModel,
  CourseContentModel,
  RoomReservationModel,
  GradeWeightModel,
} from "@/infraestructure/persistence/models/index.js";

import type { GradeType } from "@/domain/enums/index.js";
import {
  type UserRole,
  type CourseType,
  type ClassType,
  type AttendanceStatus,
  type TopicStatus,
  type ReservationStatus,
  type DayOfWeek,
} from "@/domain/enums/index.js";

import { AcademicSemester } from "@/domain/value-objects/academic-semester.vo.js";
import { TimeOfDay } from "@/domain/value-objects/time-of-day.vo.js";
import { AppDataSource } from "../persistence/database.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DIR = path.join(__dirname, "data");
const BCRYPT_ROUNDS = 10;

const CSV_FILES = {
  USERS: "users.csv",
  TEACHERS: "teacher_profiles.csv",
  STUDENTS: "student_profiles.csv",
  COURSES: "courses.csv",
  CLASSROOMS: "classrooms.csv",
  THEORY_GROUPS: "theory_groups.csv",
  LAB_GROUPS: "lab_groups.csv",
  SCHEDULES: "class_schedules.csv",
  ENROLLMENTS: "enrollments.csv",
  GRADES: "grades.csv",
  ATTENDANCE: "attendance.csv",
  CONTENTS: "course_contents.csv",
  RESERVATIONS: "room-reservations.csv",
  GRADE_WEIGHTS: "grade_weights.csv",
} as const;

interface GradeWeightCSV {
  id: string;
  theoryGroupId: string;
  type: GradeType;
  weight: string;
}

interface UserCSV {
  id: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  birthdate: string;
  status: string;
  role: UserRole;
}

interface TeacherCSV {
  id: string;
  user_id: string;
  specialization: string;
}

interface StudentCSV {
  id: string;
  user_id: string;
  studentCode: string;
}

interface CourseCSV {
  id: string;
  code: string;
  name: string;
  credits: string;
  type: CourseType;
}

interface ClassroomCSV {
  id: string;
  name: string;
  type: ClassType;
  capacity: string;
}

interface TheoryGroupCSV {
  id: string;
  course_code: string;
  professor_email: string;
  semester: string;
  groupLetter: string;
}

interface LabGroupCSV {
  id: string;
  course_code: string;
  professor_email: string;
  groupLetter: string;
  capacity: string;
}

interface ClassScheduleCSV {
  id: string;
  classroom_name: string;
  semester: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  theoryGroupId: string;
  labGroupId: string;
}

interface EnrollmentCSV {
  id: string;
  student_code: string;
  theoryGroupId: string;
}

interface GradeCSV {
  id: string;
  enrollmentId: string;
  type: GradeType;
  score: string;
}

interface AttendanceCSV {
  id: string;
  enrollmentId: string;
  date: string;
  status: AttendanceStatus;
  classType: ClassType;
}

interface CourseContentCSV {
  id: string;
  theoryGroupId: string;
  week: string;
  topicName: string;
  status: TopicStatus;
}

interface ReservationCSV {
  id: string;
  classroomId: string;
  professorId: string;
  semester: string;
  status: ReservationStatus;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

const userMap = new Map<string, UserModel>();
const studentMap = new Map<string, StudentProfileModel>();
const teacherMap = new Map<string, TeacherProfileModel>();
const courseMap = new Map<string, CourseModel>();
const classroomMap = new Map<string, ClassroomModel>();
const theoryMap = new Map<string, TheoryGroupModel>();
const labMap = new Map<string, LabGroupModel>();
const enrollmentMap = new Map<string, EnrollmentModel>();
// const gradeWeigthMap = new Map<string, GradeWeightModel>();

async function parseCSV<T>(fileName: string): Promise<T[]> {
  const fullPath = path.join(SEED_DIR, fileName);
  const content = await fs.promises.readFile(fullPath, "utf-8");
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

export function idToUUID(id: string, ns: number): string {
  const part = id.split("-").pop() ?? id;
  const padded = part.padStart(12, "0").slice(0, 12);
  const nsHex = ns.toString(16).padStart(4, "0");
  return `00000000-${nsHex}-4000-8000-${padded}`;
}

async function cleanDatabase(dataSource: DataSource) {
  const runner = dataSource.createQueryRunner();
  try {
    await runner.query("SET session_replication_role = 'replica';");
    await runner.query(`
      TRUNCATE TABLE
        "users",
        "courses",
        "classrooms"
      RESTART IDENTITY CASCADE;
    `);
    await runner.query("SET session_replication_role = 'origin';");
  } finally {
    await runner.release();
  }
}

export async function seedUsers(fileName: string, repo: Repository<UserModel>) {
  const rows = await parseCSV<UserCSV>(fileName);
  for (const row of rows) {
    const hashed = await bcrypt.hash(row.password, BCRYPT_ROUNDS);
    const user = repo.create({
      id: idToUUID(row.id, 1),
      email: row.email,
      password: hashed,
      name: row.name,
      surname: row.surname,
      birthdate: new Date(row.birthdate),
      status: row.status.toLowerCase() === "true",
      role: row.role,
    });
    const saved = await repo.save(user);
    userMap.set(row.id, saved);
  }
}

export async function seedTeacherProfiles(
  fileName: string,
  repo: Repository<TeacherProfileModel>,
) {
  const rows = await parseCSV<TeacherCSV>(fileName);
  for (const row of rows) {
    const user = userMap.get(row.user_id);
    if (!user) continue;
    const profile = repo.create({
      id: idToUUID(row.id, 2),
      userId: user.id,
      specialization: row.specialization,
    });
    teacherMap.set(row.id, await repo.save(profile));
  }
}

export async function seedStudentProfiles(
  fileName: string,
  repo: Repository<StudentProfileModel>,
) {
  const rows = await parseCSV<StudentCSV>(fileName);
  for (const row of rows) {
    const user = userMap.get(row.user_id);
    if (!user) continue;
    const profile = repo.create({
      id: idToUUID(row.id, 3),
      userId: user.id,
      studentCode: row.studentCode,
    });
    studentMap.set(row.id, await repo.save(profile));
  }
}

export async function seedCourses(
  fileName: string,
  repo: Repository<CourseModel>,
) {
  const rows = await parseCSV<CourseCSV>(fileName);
  for (const row of rows) {
    const course = repo.create({
      id: idToUUID(row.id, 4),
      code: row.code,
      name: row.name,
      credits: Number(row.credits),
      type: row.type,
    });
    courseMap.set(row.id, await repo.save(course));
  }
}

export async function seedClassrooms(
  fileName: string,
  repo: Repository<ClassroomModel>,
) {
  const rows = await parseCSV<ClassroomCSV>(fileName);
  for (const row of rows) {
    const classroom = repo.create({
      id: idToUUID(row.id, 5),
      name: row.name,
      type: row.type,
      capacity: Number(row.capacity),
    });
    classroomMap.set(row.id, await repo.save(classroom));
  }
}

export async function seedTheoryGroups(
  fileName: string,
  repo: Repository<TheoryGroupModel>,
) {
  const rows = await parseCSV<TheoryGroupCSV>(fileName);
  for (const row of rows) {
    const course = Array.from(courseMap.values()).find(
      (c) => c.code === row.course_code,
    );
    const prof = Array.from(userMap.values()).find(
      (u) => u.email === row.professor_email,
    );
    if (!course || !prof) continue;
    const entity = repo.create({
      id: idToUUID(row.id, 6),
      courseId: course.id,
      professorId: prof.id,
      semester: AcademicSemester.create(row.semester),
      groupLetter: row.groupLetter,
    });
    theoryMap.set(row.id, await repo.save(entity));
  }
}

export async function seedLabGroups(
  fileName: string,
  repo: Repository<LabGroupModel>,
) {
  const rows = await parseCSV<LabGroupCSV>(fileName);
  for (const row of rows) {
    const course = Array.from(courseMap.values()).find(
      (c) => c.code === row.course_code,
    );
    const prof = Array.from(userMap.values()).find(
      (u) => u.email === row.professor_email,
    );
    if (!course || !prof) continue;
    const entity = repo.create({
      id: idToUUID(row.id, 7),
      courseId: course.id,
      professorId: prof.id,
      groupLetter: row.groupLetter,
      capacity: Number(row.capacity),
      currentEnrollment: 0,
    });
    labMap.set(row.id, await repo.save(entity));
  }
}

export async function seedSchedules(
  fileName: string,
  repo: Repository<ClassScheduleModel>,
) {
  const rows = await parseCSV<ClassScheduleCSV>(fileName);
  for (const row of rows) {
    const classroom = Array.from(classroomMap.values()).find(
      (c) => c.name === row.classroom_name,
    );
    if (!classroom) continue;
    const schedule = repo.create({
      id: idToUUID(row.id, 8),
      classroomId: classroom.id,
      semester: AcademicSemester.create(row.semester),
      day: row.day,
      startTime: TimeOfDay.create(row.startTime),
      endTime: TimeOfDay.create(row.endTime),
      theoryGroupId: theoryMap.get(row.theoryGroupId)?.id ?? null,
      labGroupId: labMap.get(row.labGroupId)?.id ?? null,
    });
    await repo.save(schedule);
  }
}

export async function seedEnrollments(
  fileName: string,
  repo: Repository<EnrollmentModel>,
) {
  const rows = await parseCSV<EnrollmentCSV>(fileName);
  for (const row of rows) {
    const profile = Array.from(studentMap.values()).find(
      (p) => p.studentCode === row.student_code,
    );
    const group = theoryMap.get(row.theoryGroupId);
    if (!profile || !group) continue;
    const entity = repo.create({
      id: idToUUID(row.id, 9),
      studentId: profile.id,
      theoryGroupId: group.id,
      labGroupId: null,
    });
    enrollmentMap.set(row.id, await repo.save(entity));
  }
}

export async function seedGrades(
  fileName: string,
  repo: Repository<GradeModel>,
) {
  const rows = await parseCSV<GradeCSV>(fileName);
  for (const row of rows) {
    const enr = enrollmentMap.get(row.enrollmentId);
    if (!enr) continue;
    await repo.save(
      repo.create({
        id: idToUUID(row.id, 10),
        enrollmentId: enr.id,
        type: row.type,
        score: Number(row.score),
      }),
    );
  }
}

export async function seedAttendance(
  fileName: string,
  repo: Repository<AttendanceModel>,
) {
  const rows = await parseCSV<AttendanceCSV>(fileName);
  for (const row of rows) {
    const enr = enrollmentMap.get(row.enrollmentId);
    if (!enr) continue;
    await repo.save(
      repo.create({
        id: idToUUID(row.id, 11),
        enrollmentId: enr.id,
        date: new Date(row.date),
        status: row.status,
        classType: row.classType,
      }),
    );
  }
}

export async function seedContents(
  fileName: string,
  repo: Repository<CourseContentModel>,
) {
  const rows = await parseCSV<CourseContentCSV>(fileName);
  for (const row of rows) {
    const group = theoryMap.get(row.theoryGroupId);
    if (!group) continue;
    await repo.save(
      repo.create({
        id: idToUUID(row.id, 12),
        theoryGroupId: group.id,
        week: Number(row.week),
        topicName: row.topicName,
        status: row.status,
      }),
    );
  }
}

export async function seedReservations(
  fileName: string,
  repo: Repository<RoomReservationModel>,
) {
  const rows = await parseCSV<ReservationCSV>(fileName);
  for (const row of rows) {
    const classroom = classroomMap.get(row.classroomId);
    const prof = userMap.get(row.professorId);
    if (!classroom || !prof) continue;
    await repo.save(
      repo.create({
        id: idToUUID(row.id, 13),
        classroomId: classroom.id,
        professorId: prof.id,
        semester: AcademicSemester.create(row.semester),
        status: row.status,
        day: row.day,
        startTime: TimeOfDay.create(row.startTime),
        endTime: TimeOfDay.create(row.endTime),
      }),
    );
  }
}

export async function seedGradeWeigths(
  fileName: string,
  repo: Repository<GradeWeightModel>,
) {
  const rows = await parseCSV<GradeWeightCSV>(fileName);

  for (const row of rows) {
    const group = theoryMap.get(row.theoryGroupId);

    if (!group) {
      console.warn(
        `[Seed] Skipping GradeWeight ${row.id}: TheoryGroup ${row.theoryGroupId} not found.`,
      );
      continue;
    }

    const entity = repo.create({
      id: idToUUID(row.id, 14),
      theoryGroupId: group.id,
      type: row.type,
      weight: Number(row.weight),
    });

    await repo.save(entity);
  }
}

async function main() {
  try {
    await AppDataSource.initialize();
    await cleanDatabase(AppDataSource);

    const userRepo = AppDataSource.getRepository(UserModel);
    const teacherRepo = AppDataSource.getRepository(TeacherProfileModel);
    const studentRepo = AppDataSource.getRepository(StudentProfileModel);
    const courseRepo = AppDataSource.getRepository(CourseModel);
    const classroomRepo = AppDataSource.getRepository(ClassroomModel);
    const theoryRepo = AppDataSource.getRepository(TheoryGroupModel);
    const labRepo = AppDataSource.getRepository(LabGroupModel);
    const scheduleRepo = AppDataSource.getRepository(ClassScheduleModel);
    const enrollmentRepo = AppDataSource.getRepository(EnrollmentModel);
    const gradeRepo = AppDataSource.getRepository(GradeModel);
    const attendanceRepo = AppDataSource.getRepository(AttendanceModel);
    const contentRepo = AppDataSource.getRepository(CourseContentModel);
    const reservationRepo = AppDataSource.getRepository(RoomReservationModel);
    const gradeWeightRepo = AppDataSource.getRepository(GradeWeightModel);

    await seedUsers(CSV_FILES.USERS, userRepo);
    await seedTeacherProfiles(CSV_FILES.TEACHERS, teacherRepo);
    await seedStudentProfiles(CSV_FILES.STUDENTS, studentRepo);
    await seedCourses(CSV_FILES.COURSES, courseRepo);
    await seedClassrooms(CSV_FILES.CLASSROOMS, classroomRepo);
    await seedTheoryGroups(CSV_FILES.THEORY_GROUPS, theoryRepo);
    await seedLabGroups(CSV_FILES.LAB_GROUPS, labRepo);
    await seedSchedules(CSV_FILES.SCHEDULES, scheduleRepo);
    await seedEnrollments(CSV_FILES.ENROLLMENTS, enrollmentRepo);
    await seedGrades(CSV_FILES.GRADES, gradeRepo);
    await seedAttendance(CSV_FILES.ATTENDANCE, attendanceRepo);
    await seedContents(CSV_FILES.CONTENTS, contentRepo);
    await seedReservations(CSV_FILES.RESERVATIONS, reservationRepo);
    await seedGradeWeigths(CSV_FILES.GRADE_WEIGHTS, gradeWeightRepo);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error(err);
    try {
      await AppDataSource.destroy();
    } catch {
      // pass
    }
    process.exit(1);
  }
}

void main();
