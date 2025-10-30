import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Teacher } from './Teacher';
import { Course } from './Course';
import { Laboratory } from './Laboratory';
import { Enrollment } from './Enrollment';

@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sectionCode: string;

  @Column()
  group: string;

  @ManyToOne(() => Teacher,
    teacher => teacher.sections)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: number;

  @ManyToOne(() => Course,
    course => course.sections)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;

  @OneToMany(() => Laboratory,
    laboratory => laboratory.section)
  laboratories: Laboratory[];

  @OneToMany(() => Enrollment, enrollment => enrollment.section)
  enrollments: Enrollment[];
}
