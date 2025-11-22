import { type ICourseContentRepository } from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";
import { TopicStatus } from "@/domain/enums/index.js";

export interface CourseProgressDto {
  syllabus: {
    week: number;
    topic: string;
    status: string;
  }[];
  progressPercentage: number;
}

export class GetStudentCourseProgressUseCase {
  constructor(
    private readonly courseContentRepository: ICourseContentRepository
  ) {}

  public async execute(
    studentProfileId: string,
    enrollmentId: string
  ): Promise<CourseProgressDto> {
    const studentIdVO = Id.create(studentProfileId);
    const enrollmentIdVO = Id.create(enrollmentId);

    // If the student does not own the enrollment, this will return an empty array.
    const contents = await this.courseContentRepository.findByEnrollmentId(
      enrollmentIdVO,
      studentIdVO
    );

    // Calculate percentage
    const totalTopics = contents.length;
    const completedTopics = contents.filter(
      (c) => c.status === TopicStatus.COMPLETED
    ).length;

    const percentage = totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;

    return {
      syllabus: contents.map((c) => ({
        week: c.week,
        topic: c.topicName,
        status: c.status,
      })),
      progressPercentage: percentage,
    };
  }
}
