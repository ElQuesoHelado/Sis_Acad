import { AppDataSource } from '../src/data-source';
import { Student } from '../src/entity/Student';

async function testDatabase() {
  console.log('Connecting to the database...');
  await AppDataSource.initialize();
  console.log('Connection successful.');

  const studentRepository = AppDataSource.getRepository(Student);

  const totalStudents = await studentRepository.count();
  console.log(`\nTotal students found: ${totalStudents}`);

  console.log('\nFetching first 10 students:');
  const firstFiveStudents = await studentRepository.find({ take: 10 });

  console.table(firstFiveStudents);

  await AppDataSource.destroy();
  console.log('\nDatabase connection closed.');
}

testDatabase().catch(err => console.error('Test failed:', err));
