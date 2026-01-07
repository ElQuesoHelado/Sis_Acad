import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("system_configs")
export class SystemConfigModel {
  @PrimaryColumn({ type: "varchar" })
  key: string;

  @Column({ type: "varchar" })
  value: string;
}

