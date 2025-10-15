import { ChildEntity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"
import { User } from "./User";

@ChildEntity()
export class Teacher extends User {
  @Column()
  specialty: string
}
