import { type ICourseRepository } from "@/domain/repositories/index.js";
import { CourseType } from "@/domain/enums/index.js";

export interface CourseSummaryDto {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: CourseType;  // THEORY, LAB, or MIXED
}

export class GetAllCoursesUseCase {
  constructor(private readonly courseRepo: ICourseRepository) {}

  public async execute(): Promise<CourseSummaryDto[]> {
    const courses = await this.courseRepo.findAll();

    return courses.map(course => ({
      id: course.id.value,
      code: course.code.value,
      name: course.name,
      credits: course.credits.value,
      type: course.type
    }));
  }
}