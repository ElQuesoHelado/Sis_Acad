import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CourseTopic } from './CourseTopic';
import { Section } from './Section';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  credits: number;

  @OneToMany(() => CourseTopic,
    topic => topic.course)
  topics: CourseTopic[];

  @OneToMany(() => Section,
    section => section.courseId)
  sections: Section[];
}
