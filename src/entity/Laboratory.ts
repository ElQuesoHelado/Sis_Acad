import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Teacher } from './Teacher';
import { Course } from './Course';
import { Section } from './Section';

@Entity()
export class Laboratory {
  @PrimaryGeneratedColumn()
  labId: number;

  @Column()
  group: string;

  @ManyToOne(() => Teacher,
    teacher => teacher.sections)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: number;

  @ManyToOne(() => Section,
    section => section.laboratories)
  @JoinColumn({ name: 'sectionId' })
  section: Section;

  @Column()
  sectionId: number;
}
