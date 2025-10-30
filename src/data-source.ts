import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Student } from "./entity/Student"
import { Secretary } from "./entity/Secretary"
import { Admin } from "./entity/Admin"
import { Teacher } from "./entity/Teacher"
import { Course } from "./entity/Course"
import { CourseTopic } from "./entity/CourseTopic"
import { Classroom } from "./entity/Classroom"
import { Section } from "./entity/Section"
import { ScheduleSlot } from "./entity/ScheduleSlot"
import { Laboratory } from "./entity/Laboratory"

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [User, Student, Admin, Secretary, Teacher, Course,
    CourseTopic, Classroom, Section, ScheduleSlot, Laboratory],
  migrations: [],
  subscribers: [],
})
