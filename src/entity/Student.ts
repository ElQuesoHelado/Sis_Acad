import { ChildEntity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"
import { User } from "./User"


@ChildEntity()
export class Student extends User {
  @Column()
  enrollmentYear: number
}
