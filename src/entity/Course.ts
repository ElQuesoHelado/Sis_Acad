import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CourseTopic } from './CourseTopic';

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

  @OneToMany(() => CourseTopic, topic => topic.course)
  topics: CourseTopic[];
}
