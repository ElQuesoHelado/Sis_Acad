import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, ManyToOne, JoinColumn,
  BaseEntity, TableInheritance
} from "typeorm"
import { Course } from "./Course";

export enum TopicState {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

@Entity()
export class CourseTopic {
  @PrimaryGeneratedColumn()
  topicId: number;

  @Column()
  week: number;

  @Column()
  topicName: string;

  @Column({
    enum: TopicState,
    default: TopicState.PENDING
  })
  state: TopicState;

  @ManyToOne(() => Course, course => course.topics)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;
}
