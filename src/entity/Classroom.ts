import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Classroom {
  @PrimaryColumn()
  ipAddress: string;

  @Column()
  name: string;

  @Column()
  capacity: number;
}
