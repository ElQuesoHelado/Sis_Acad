import type { ClassType } from "@/domain/enums/index.js";

export interface ClassroomDto {
  id: string;
  name: string;
  type: ClassType;
  capacity: number;
}
