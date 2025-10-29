import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Teacher } from './Teacher';
import { Course } from './Course';

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

}
