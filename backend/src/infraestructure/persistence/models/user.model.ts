/**
 * @file TypeORM model for the User entity.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import { UserRole } from "../../../domain/enums/user-role.enum.js";
import { StudentProfileModel } from "./student-profile.model.js";
import { TheoryGroupModel } from "./theory-group.model.js";
import { LabGroupModel } from "./lab-group.model.js";
import { TeacherProfileModel } from "./teacher-profile.model.js";
import { RoomReservationModel } from "./room-reservation.model.js";

/**
 * TypeORM model representing a User in the system.
 *
 * A User can be a student or a teacher and may have related profiles,
 * groups, and reservations. This entity handles authentication and user roles.
 *
 * @extends BaseEntity
 */
@Entity("users")
export class UserModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** User's unique email for authentication. */
  @Column("varchar", { length: 255, nullable: false, unique: true })
  email: string;

  /** Hashed password for login. */
  @Column("varchar", { length: 255, nullable: false })
  password: string;

  /** Role of the user (e.g., STUDENT, TEACHER). */
  @Column({
    type: "enum",
    enum: UserRole,
    nullable: false,
  })
  role: UserRole;

  /** First name of the user. */
  @Column("varchar", { length: 100, nullable: false })
  name: string;

  /** Last name of the user. */
  @Column("varchar", { length: 100, nullable: false })
  surname: string;

  /** Birthdate of the user. */
  @Column("date", { nullable: false })
  birthdate: Date;

  /** Indicates if the user is active. Defaults to true. */
  @Column("boolean", { default: true })
  status: boolean;

  // --- Relations ---

  /** Student profile (if the user is a student). */
  @OneToOne(() => StudentProfileModel, (profile) => profile.user)
  studentProfile: StudentProfileModel;

  /** Teacher profile (if the user is a teacher). */
  @OneToOne(() => TeacherProfileModel, (profile) => profile.user)
  teacherProfile: TeacherProfileModel;

  /** Groups taught by the teacher (theory). */
  @OneToMany(() => TheoryGroupModel, (group) => group.professor)
  theoryGroups: TheoryGroupModel[];

  /** Groups taught by the teacher (lab). */
  @OneToMany(() => LabGroupModel, (group) => group.professor)
  labGroups: LabGroupModel[];

  /**
   * Room reservations made by the teacher.
   * A teacher can have multiple punctual reservations for classrooms.
   */
  @OneToMany(() => RoomReservationModel, (reservation) => reservation.professor)
  reservations: RoomReservationModel[];

  // --- Timestamps ---
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
