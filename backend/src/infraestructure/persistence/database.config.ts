import "reflect-metadata";

import { DataSource } from "typeorm";
import { env } from "../config/index.js";

import { UserModel } from "../persistence/models/user.model.js";
import { StudentProfileModel } from "../persistence/models/student-profile.model.js";
import { TeacherProfileModel } from "../persistence/models/teacher-profile.model.js";
import { CourseModel } from "../persistence/models/course.model.js";
import { ClassroomModel } from "../persistence/models/classroom.model.js";
import { TheoryGroupModel } from "../persistence/models/theory-group.model.js";
import { LabGroupModel } from "../persistence/models/lab-group.model.js";
import { ClassScheduleModel } from "../persistence/models/class-schedule.model.js";
import { EnrollmentModel } from "../persistence/models/enrollment.model.js";
import { GradeModel } from "./models/grade.model.js";
import { AttendanceModel } from "./models/attendance.model.js";
import { CourseContentModel } from "./models/course-content.model.js";
import { RoomReservationModel } from "./models/room-reservation.model.js";
import { GradeWeightModel } from "./models/grade-weight.model.js";
import { GroupPortfolioModel } from "./models/group-portfolio.model.js";

const dbType = env.DB_TYPE || "postgres";

export const AppDataSource = new DataSource({
  type: dbType as any,
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.APP_ENV === "development",
  logging: env.APP_ENV === "development",
  entities: [
    UserModel,
    StudentProfileModel,
    TeacherProfileModel,
    CourseModel,
    ClassroomModel,
    TheoryGroupModel,
    LabGroupModel,
    ClassScheduleModel,
    EnrollmentModel,
    GradeModel,
    AttendanceModel,
    CourseContentModel,
    RoomReservationModel,
    GradeWeightModel,
    GroupPortfolioModel
  ],
  migrations: [],
  subscribers: [],
});
