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

const DATA_PATHS = {
  STUDENTS: '../data/students.csv',
  TEACHERS: '../data/teachers.csv',
  COURSES: '../data/courses.csv',
  COURSE_TOPICS: '../data/course_topics.csv'
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
  console.log(`Seeded ${teachers.length} students.`);
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

async function seed() {
  console.log('Starting database seeding...');

  await AppDataSource.initialize();

  try {
    await seedStudents();
    await seedTeachers();
    const courses = await seedCourses();
    await seedCourseTopics(courses);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch(error => console.error('Error seeding database:', error));
