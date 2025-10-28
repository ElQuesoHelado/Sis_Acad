import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Teacher } from './Teacher';

@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sectionCode: string;

  @Column()
  capacity: number;

  @ManyToOne(() => Teacher, teacher => teacher.sections)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: number;
}
