import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './Student';
import { Section } from './Section';

export enum EnrollmentState {
  ENROLLED = 'ENROLLED',
  WITHDRAWN = 'WITHDRAWN',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  enrollmentId: number;

  @ManyToOne(() => Student,
    student => student.enrollments)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentCui: number;

  @ManyToOne(() => Section,
    section => section.enrollments)
  @JoinColumn({ name: 'sectionId' })
  section: Section;

  @Column()
  sectionId: number;

  @Column({
    enum: EnrollmentState,
    default: EnrollmentState.ENROLLED
  })
  state: EnrollmentState;

}
