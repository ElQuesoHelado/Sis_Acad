import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { AppDataSource } from '../src/data-source';
import { Student } from '../src/entity/Student';
import { Teacher } from '../src/entity/Teacher';
import * as bcrypt from 'bcrypt';
import { Course } from '../src/entity/Course';
import { CourseTopic } from '../src/entity/CourseTopic';
import { User } from '../src/entity/User';
import { Admin } from '../src/entity/Admin';
import { Secretary } from '../src/entity/Secretary';
import { Classroom } from '../src/entity/Classroom';

const DATA_PATHS = {
  STUDENTS: '../data/students.csv',
  TEACHERS: '../data/teachers.csv',
  ADMINS: '../data/admins.csv',
  SECRETARIES: '../data/secretaries.csv',
  COURSES: '../data/courses.csv',
  COURSE_TOPICS: '../data/course_topics.csv',
  CLASSROOMS: '../data/classrooms.csv'
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
}

async function seed() {
  console.log('Starting database seeding...');

  await AppDataSource.initialize();

  try {
    await seedStudents();
    await seedTeachers();
    await seedAdmins();
    await seedSecretaries();

    const courses = await seedCourses();
    await seedCourseTopics(courses);

    await seedClassrooms();

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch(error => console.error('Error seeding database:', error));
