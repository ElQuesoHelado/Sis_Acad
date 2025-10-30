import { ChildEntity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { User } from "./User"
import { Section } from "./Section";
import { Enrollment } from "./Enrollment";


@ChildEntity()
export class Student extends User {
  @Column()
  cui: number

  @Column()
  enrollmentYear: number

  @Column({ type: "varchar", length: 1 })
  enrollmentCycle: string;

  @OneToMany(() => Enrollment, enrollment => enrollment.student)
  enrollments: Enrollment[];
}
