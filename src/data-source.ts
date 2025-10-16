import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Student } from "./entity/Student"

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [User, Student],
  migrations: [],
  subscribers: [],
})
