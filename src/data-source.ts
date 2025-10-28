import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Student } from "./entity/Student"
import { Secretary } from "./entity/Secretary"
import { Admin } from "typeorm"
import { Teacher } from "./entity/Teacher"
import { Course } from "./entity/Course"
import { CourseTopic } from "./entity/CourseTopic"

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [User, Student, Admin, Secretary, Teacher, Course, CourseTopic],
  migrations: [],
  subscribers: [],
})
