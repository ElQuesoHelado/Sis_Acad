import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ScheduleSlot } from './ScheduleSlot';

@Entity()
export class Classroom {
  @PrimaryColumn()
  ipAddress: string;

  @Column()
  name: string;

  @Column()
  capacity: number;

  @OneToMany(() => ScheduleSlot,
    scheduleSlot => scheduleSlot.classroomIp)
  scheduleSlots: ScheduleSlot[];
}
