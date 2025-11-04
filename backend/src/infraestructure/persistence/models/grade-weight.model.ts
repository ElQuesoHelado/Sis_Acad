/**
 * @file TypeORM model for the GradeWeight entity.
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { TheoryGroupModel } from "./theory-group.model.js";
import { GradeType } from "@/domain/enums/index.js";

/**
 * Maps to the "grade_weights" table.
 * Defines the percentage weight for a GradeType within a TheoryGroup.
 *
 * @note Unique index ensures only one weight per grade type per group.
 */
@Entity("grade_weights")
@Index("UQ_group_gradetype", ["theoryGroupId", "type"], { unique: true })
export class GradeWeightModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key to the TheoryGroup. */
  @Column({ type: "uuid", name: "theory_group_id" })
  theoryGroupId: string;

  /** Relation to the TheoryGroup. */
  @ManyToOne(() => TheoryGroupModel)
  @JoinColumn({ name: "theory_group_id" })
  theoryGroup: TheoryGroupModel;

  /** The type of grade this weight applies to (e.g., partial_1). */
  @Column({
    type: "enum",
    enum: GradeType,
    nullable: false,
  })
  type: GradeType;

  /** The percentage value (e.g., 20.00 for 20%). */
  @Column("decimal", {
    precision: 5, // Allows 100.00
    scale: 2,
    nullable: false,
  })
  weight: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
