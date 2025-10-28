import { ChildEntity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { User } from "./User";
import { Section } from "./Section";

@ChildEntity()
export class Teacher extends User {
  @Column()
  specialty: string

  @OneToMany(() => Section, section => section.teacher)
  sections: Section[];

  async recordAttendance(
    sectionId: string,
    sessionDate: Date,
    attendance: Array<{ studentId: string; status: string }>
  ): Promise<boolean> {
    return true
  }

  async uploadGrade(
    sectionId: string,
    grades: Array<{
      studentId: string
      gradeType: string
      gradeNumber: number
      score: number
    }>
  ): Promise<boolean> {
    return true
  }

  async viewAssignedSections(): Promise<any[]> {
    return []
  }

  async reserveClassroom(
    classroomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    return null
  }

}
