import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Classroom } from './Classroom';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY'
}

export enum SlotType {
  SECTION = 'SECTION',
  LABORATORY = 'LABORATORY',
  RESERVATION = 'RESERVATION',
}

@Entity()
export class ScheduleSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    enum: DayOfWeek
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({
    enum: SlotType
  })
  slotType: SlotType;

  // Permite varias tablas distintas
  @Column()
  ownerId: number;

  @ManyToOne(() => Classroom, classroom => classroom.scheduleSlots)
  @JoinColumn({ name: 'classroomIp' })
  classroom: Classroom;

  @Column()
  classroomIp: number;

}
