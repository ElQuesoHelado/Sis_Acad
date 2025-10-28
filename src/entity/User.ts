import {
  Entity, PrimaryGeneratedColumn, Column,
  BaseEntity, TableInheritance
} from "typeorm"

@Entity()
@TableInheritance({ column: { type: "varchar", name: "role" } })
export abstract class User {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  email: string

  @Column()
  passwordHash: string

  @Column()
  isActive: boolean

  @Column()
  role: string
}
