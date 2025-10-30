import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../src/data-source';
import { Student } from '../src/entity/Student';
import { Teacher } from '../src/entity/Teacher';
import { Course } from '../src/entity/Course';
import { CourseTopic } from '../src/entity/CourseTopic';
import { User } from '../src/entity/User';
import { Admin } from '../src/entity/Admin';
import { Secretary } from '../src/entity/Secretary';
import { Classroom } from '../src/entity/Classroom';
import { ScheduleSlot } from '../src/entity/ScheduleSlot';
import { Section } from '../src/entity/Section';
import { Laboratory } from '../src/entity/Laboratory';
import { Enrollment } from '../src/entity/Enrollment';

const DATA_PATHS = {
  STUDENTS: '../data/students.csv',
  TEACHERS: '../data/teachers.csv',
  ADMINS: '../data/admins.csv',
  SECRETARIES: '../data/secretaries.csv',
  COURSES: '../data/courses.csv',
  COURSE_TOPICS: '../data/course_topics.csv',
  CLASSROOMS: '../data/classrooms.csv',
  SCHEDULE_SLOTS: '../data/schedule_slots.csv',
  LABORATORIES: '../data/laboratories.csv',
  SECTION: '../data/sections.csv',
  ENROLLMENTS: '../data/enrollments.csv'
};

async function hashPassword(plainTextPassword: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  return hashedPassword;
}

function generateDefaultPassword(user: User): string {
  const firstNamePart = user.firstName.split(' ')[0].toLowerCase();
  const lastNamePart = user.lastName.split(' ')[0].toLowerCase();
  // const cuiPart = student.cui;
  const defaultPassword = `${firstNamePart}.${lastNamePart}`;

  return defaultPassword;
}



async function readCSV<T>(filePath: string, mapper: (row: any) => Promise<T> | T): Promise<T[]> {
  const results: Promise<T>[] = []; // Cambiar a array de Promesas
  const csvPath = path.resolve(__dirname, filePath);

  if (!fs.existsSync(csvPath)) {
    console.warn(`CSV not found: ${csvPath}`);
    return [];
  }

  const parser = fs.createReadStream(csvPath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const row of parser) {
    const result = mapper(row);
    results.push(Promise.resolve(result));
  }

  return Promise.all(results);// Para poder guardar
}


async function seedStudents() {
  console.log('Seeding students...');

  const studentRepository = AppDataSource.getRepository(Student);
  const students = await readCSV(DATA_PATHS.STUDENTS, async (row) => {
    const student = new Student();
    student.firstName = row.first_name;
    student.lastName = row.last_name;
    student.email = row.email;
    student.enrollmentYear = parseInt(row.enrollment_year, 10);
    student.enrollmentCycle = row.enrollment_cycle;
    student.cui = row.cui;

    const defaultPassword = generateDefaultPassword(student);
    student.passwordHash = await hashPassword(defaultPassword);
    student.isActive = false;

    return student;
  });

  // await studentRepository.clear();
  await studentRepository.save(students);
  console.log(`Seeded ${students.length} students.`);

  return students;
}

async function seedTeachers() {
  console.log('Seeding teachers...');

  const teacherRepository = AppDataSource.getRepository(Teacher);
  const teachers = await readCSV(DATA_PATHS.TEACHERS, async (row) => {
    const teacher = new Teacher();
    teacher.firstName = row.first_name;
    teacher.lastName = row.last_name;
    teacher.email = row.email;
    teacher.specialty = row.specialty;

    const defaultPassword = generateDefaultPassword(teacher);
    teacher.passwordHash = await hashPassword(defaultPassword);
    teacher.isActive = false;

    return teacher;
  });

  // await teacherRepository.clear();
  await teacherRepository.save(teachers);
  console.log(`Seeded ${teachers.length} teachers.`);

  return teachers;
}

async function seedAdmins() {
  console.log('Seeding admins...');

  const adminRepository = AppDataSource.getRepository(Admin);
  const admins = await readCSV(DATA_PATHS.ADMINS, async (row) => {
    const admin = new Admin();
    admin.firstName = row.first_name;
    admin.lastName = row.last_name;
    admin.email = row.email;

    const defaultPassword = generateDefaultPassword(admin);
    admin.passwordHash = await hashPassword(defaultPassword);
    admin.isActive = false;

    return admin;
  });

  await adminRepository.save(admins);
  console.log(`Seeded ${admins.length} admins.`);
}

async function seedSecretaries() {
  console.log('Seeding secretaries...');

  const secretaryRepository = AppDataSource.getRepository(Secretary);
  const secretaries = await readCSV(DATA_PATHS.SECRETARIES, async (row) => {
    const secretary = new Secretary();
    secretary.firstName = row.first_name;
    secretary.lastName = row.last_name;
    secretary.email = row.email;

    const defaultPassword = generateDefaultPassword(secretary);
    secretary.passwordHash = await hashPassword(defaultPassword);
    secretary.isActive = false;

    return secretary;
  });

  await secretaryRepository.save(secretaries);
  console.log(`Seeded ${secretaries.length} secretaries.`);
}


async function seedCourses() {
  console.log('Seeding courses...');

  const courseRepository = AppDataSource.getRepository(Course);
  const courses = await readCSV(DATA_PATHS.COURSES, async (row) => {
    const course = new Course();
    course.code = row.code;
    course.name = row.name;
    course.credits = row.credits;

    return course;
  });

  // await courseRepository.clear();
  await courseRepository.save(courses);
  console.log(`Seeded ${courses.length} courses.`);

  return courses;
}

async function seedCourseTopics(courses: Course[]) {
  console.log('Seeding course topics...');

  const topicRepository = AppDataSource.getRepository(CourseTopic);

  const courseMap = new Map(courses.map(course => [course.id, course]));

  const topics = await readCSV(DATA_PATHS.COURSE_TOPICS, (row) => {
    const topic = new CourseTopic();
    topic.week = parseInt(row.week, 10);
    topic.topicName = row.topicName;
    topic.state = row.state;

    const course = courseMap.get(parseInt(row.courseId, 10));
    if (course) {
      topic.course = course;
    } else {
      console.warn(`Curso no encontrado: ${row.course_code} para topic: ${row.topic_name}`);
    }

    return topic;
  });

  const validTopics = topics.filter(topic => topic.course !== undefined);

  // await topicRepository.clear();
  await topicRepository.save(validTopics);
  console.log(`Seeded ${validTopics.length} course topics.`);
}

async function seedClassrooms() {
  console.log('Seeding classrooms...');

  const classroomRepository = AppDataSource.getRepository(Classroom);

  const classrooms = await readCSV(DATA_PATHS.CLASSROOMS, async (row) => {
    const classroom = new Classroom();
    classroom.ipAddress = row.ipAddress;
    classroom.name = row.name;
    classroom.capacity = row.capacity;

    return classroom;
  });

  // await courseRepository.clear();
  await classroomRepository.save(classrooms);
  console.log(`Seeded ${classrooms.length} classrooms.`);
  return classrooms;
}

async function seedScheduleSlots(classrooms: Classroom[]) {
  console.log('Seeding schedule slots...');

  const scheduleSlotRepository = AppDataSource.getRepository(ScheduleSlot);

  const classroomMap = new Map(classrooms.map(classroom => [classroom.ipAddress, classroom]));

  const scheduleSlots = await readCSV(DATA_PATHS.SCHEDULE_SLOTS, (row) => {
    const scheduleSlot = new ScheduleSlot();
    scheduleSlot.dayOfWeek = row.dayOfWeek;
    scheduleSlot.startTime = row.startTime;
    scheduleSlot.endTime = row.endTime;
    scheduleSlot.slotType = row.slotType;
    scheduleSlot.ownerId = row.ownerId;
    scheduleSlot.classroomIp = row.classroomIp;


    const classroom = classroomMap.get(row.classroomIp);
    if (classroom) {
      scheduleSlot.classroom = classroom;
    } else {
      console.warn(`Classroom no encontrado: ${row.classroomIp}`);
    }

    // console.log(scheduleSlot);

    return scheduleSlot;
  });

  const validScheduleSlots = scheduleSlots.filter(slot => slot.classroom !== undefined);

  // await topicRepository.clear();
  await scheduleSlotRepository.save(validScheduleSlots);
  console.log(`Seeded ${validScheduleSlots.length} schedule slots.`);
}

async function seedSection(teachers: Teacher[], courses: Course[]) {
  console.log('Seeding sections...');

  const sectionRepository = AppDataSource.getRepository(Section);

  const teacherMap = new Map(teachers.map(teacher => [teacher.id, teacher]));
  const courseMap = new Map(courses.map(course => [course.id, course]));

  const sections = await readCSV(DATA_PATHS.SECTION, (row) => {
    const section = new Section();
    section.sectionCode = row.code;
    section.group = row.code;
    section.teacherId = row.teacherId;
    section.courseId = row.courseId;

    const teacher = teacherMap.get(parseInt(row.teacherId, 10));
    const course = courseMap.get(parseInt(row.courseId, 10));

    if (teacher) {
      section.teacher = teacher;
    } else {
      console.warn(`Profesor no encontrado: ${row.teacherId}`);
    }

    if (course) {
      section.course = course;
    } else {
      console.warn(`Curso no encontrado: ${row.courseId}`);
    }

    return section;
  });

  const validSections = sections.filter(section =>
    section.teacher !== undefined && section.course !== undefined);

  // await topicRepository.clear();
  await sectionRepository.save(validSections);
  console.log(`Seeded ${validSections.length} sections.`);

  return validSections;
}

async function seedLaboratory(teachers: Teacher[], sections: Section[]) {
  console.log('Seeding laboratories...');

  const laboratoryRepository = AppDataSource.getRepository(Laboratory);

  const teacherMap = new Map(teachers.map(teacher => [teacher.id, teacher]));
  const sectionMap = new Map(sections.map(section => [section.id, section]));

  const laboratories = await readCSV(DATA_PATHS.LABORATORIES, (row) => {
    const laboratory = new Laboratory();
    laboratory.group = row.group;
    laboratory.teacherId = row.teacherId;
    laboratory.sectionId = row.sectionId;

    const section = sectionMap.get(parseInt(row.sectionId, 10));
    const teacher = teacherMap.get(parseInt(row.teacherId, 10));

    if (teacher) {
      laboratory.teacher = teacher;
    } else {
      console.warn(`Profesor no encontrado: ${row.teacherId}`);
    }

    if (section) {
      laboratory.section = section;
    } else {
      console.warn(`Section no encontrado: ${row.sectionId}`);
    }

    return laboratory;
  });

  const validLaboratories = laboratories.filter(lab =>
    lab.teacher !== undefined && lab.section !== undefined);

  // await topicRepository.clear();
  await laboratoryRepository.save(validLaboratories);
  console.log(`Seeded ${validLaboratories.length} laboratories.`);
}

async function seedEnrollment(students: Student[], sections: Section[]) {
  console.log('Seeding enrollments...');

  const enrollmentRepository = AppDataSource.getRepository(Enrollment);

  const studentMap = new Map(students.map(student => [student.cui, student]));
  const sectionMap = new Map(sections.map(section => [section.id, section]));

  const enrollments = await readCSV(DATA_PATHS.ENROLLMENTS, (row) => {
    const enrollment = new Enrollment();
    enrollment.studentCui = row.cui;
    enrollment.sectionId = row.sectionId;

    const section = sectionMap.get(parseInt(row.sectionId, 10));
    const student = studentMap.get(row.cui);

    if (student) {
      enrollment.student = student;
    } else {
      console.warn(`Student no encontrado: ${row.cui}`);
    }

    if (section) {
      enrollment.section = section;
    } else {
      console.warn(`Section no encontrado: ${row.sectionId}`);
    }

    return enrollment;
  });

  const validEnrollments = enrollments.filter(enrollment =>
    enrollment.student !== undefined && enrollment.section !== undefined);

  // await topicRepository.clear();
  await enrollmentRepository.save(validEnrollments);
  console.log(`Seeded ${validEnrollments.length} enrollments.`);
}

async function seed() {
  console.log('Starting database seeding...');

  await AppDataSource.initialize();

  try {
    //FIXME: Siempre teacher primero
    const teachers = await seedTeachers();
    const students = await seedStudents();
    await seedAdmins();
    await seedSecretaries();

    const courses = await seedCourses();
    await seedCourseTopics(courses);

    const classrooms = await seedClassrooms();

    await seedScheduleSlots(classrooms);

    const sections = await seedSection(teachers, courses);
    await seedLaboratory(teachers, sections);

    await seedEnrollment(students, sections);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch(error => console.error('Error seeding database:', error));
