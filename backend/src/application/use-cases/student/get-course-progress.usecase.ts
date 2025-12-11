import { type ICourseContentRepository, type IEnrollmentRepository, type IGroupPortfolioRepository } from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";
import { TopicStatus } from "@/domain/enums/index.js";

export interface CourseProgressDto {
  syllabus: {
    week: number;
    topic: string;
    status: string;
  }[];
  progressPercentage: number;
  syllabusUrl?: string;
}
export class GetStudentCourseProgressUseCase {
  constructor(
    private readonly courseContentRepository: ICourseContentRepository,
    private readonly portfolioRepo: IGroupPortfolioRepository,
    private readonly enrollmentRepo: IEnrollmentRepository
  ) { }

  public async execute(
    studentProfileId: string,
    enrollmentId: string
  ): Promise<CourseProgressDto> {
    const studentIdVO = Id.create(studentProfileId);
    const enrollmentIdVO = Id.create(enrollmentId);

    const enrollment = await this.enrollmentRepo.findById(enrollmentIdVO);
    if (!enrollment || !enrollment.studentId.equals(studentIdVO)) {
      throw new Error("Enrollment not found or unauthorized");
    }

    const contents = await this.courseContentRepository.findByEnrollmentId(
      enrollmentIdVO,
      studentIdVO
    );

    const portfolio = await this.portfolioRepo.findByGroupId(enrollment.theoryGroupId);

    const totalTopics = contents.length;
    const completedTopics = contents.filter(c => c.status === TopicStatus.COMPLETED).length;
    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      syllabus: contents.map((c) => ({
        week: c.week,
        topic: c.topicName,
        status: c.status,
      })),
      progressPercentage: percentage,
      syllabusUrl: portfolio?.syllabusUrl
    };
  }
}
