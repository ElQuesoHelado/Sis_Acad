import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { AppDataSource } from '../src/data-source';
import { Student } from '../src/entity/Student';
import * as bcrypt from 'bcrypt';

const STUDENT_DATA_PATH = '../data/students.csv'


async function hashPassword(plainTextPassword: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  return hashedPassword;
}

function generateDefaultPassword(student: Student): string {
  const firstNamePart = student.firstName.split(' ')[0].toLowerCase();
  const lastNamePart = student.lastName.split(' ')[0].toLowerCase();
  const cuiPart = student.cui;
  const defaultPassword = `${firstNamePart}.${lastNamePart}.${cuiPart}`;

  return defaultPassword;
}

async function seed() {
  console.log('Seeding database...');

  await AppDataSource.initialize();

  const studentRepository = AppDataSource.getRepository(Student);
  const students: Student[] = [];
  const csvPath = path.resolve(__dirname, STUDENT_DATA_PATH);

  const parser = fs.createReadStream(csvPath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const row of parser) {
    const student = new Student();
    student.firstName = row.first_name;
    student.lastName = row.last_name;
    student.email = row.email;
    student.enrollmentYear = parseInt(row.enrollment_year, 10);
    student.enrollmentCycle = row.enrollment_cycle;
    student.cui = row.cui

    const defaultPassword = generateDefaultPassword(student);
    student.passwordHash = await hashPassword(defaultPassword);
    student.isActive = false;
    students.push(student);
  }

  await studentRepository.clear();
  await studentRepository.save(students);
  await AppDataSource.destroy();

  console.log(`Seeded ${students.length} students.`);
}

seed().catch(error => console.error('Error seeding database:', error));
