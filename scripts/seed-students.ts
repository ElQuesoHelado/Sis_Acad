import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { AppDataSource } from '../src/data-source';
import { Student } from '../src/entity/Student';

const STUDENT_DATA_PATH = '../data/students.csv'

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
    student.passwordHash = null;
    student.isActive = false;

    students.push(student);
  }

  await studentRepository.clear();
  await studentRepository.save(students);
  await AppDataSource.destroy();

  console.log(`Seeded ${students.length} students.`);
}

seed().catch(error => console.error('Error seeding database:', error));
