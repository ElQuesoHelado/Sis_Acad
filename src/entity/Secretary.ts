import { ChildEntity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"
import { User } from "./User";

@ChildEntity()
export class Secretary extends User {
}
