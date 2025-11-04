import { ApiService } from './api.service';
import type {
	CourseResponse,
	CreateCourseRequest,
	UploadSyllabusRequest,
	UploadSyllabusResponse
} from './types';

/**
 * Service class for managing course-related API calls.
 */
export class CourseService {
	/**
	 * Creates a new course.
	 * Corresponds to: POST /courses
	 * Requires Admin/Secretary permissions.
	 * @param courseData - The details of the course to create.
	 * @returns A promise that resolves with the created CourseResponse object.
	 */
	static async createCourse(courseData: CreateCourseRequest): Promise<CourseResponse> {
		return ApiService.post<CourseResponse>('/courses', courseData);
	}

	/**
	 * Retrieves a list of all available courses.
	 * Corresponds to: GET /courses
	 * @returns A promise that resolves with an array of CourseResponse objects.
	 */
	static async getAllCourses(): Promise<CourseResponse[]> {
		return ApiService.get<CourseResponse[]>('/courses');
	}

	/**
	 * Retrieves a single course by its unique ID.
	 * Corresponds to: GET /courses/{courseId}
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with the CourseResponse object.
	 */
	static async getCourseById(courseId: string): Promise<CourseResponse> {
		return ApiService.get<CourseResponse>(`/courses/${courseId}`);
	}

	/**
	 * Uploads or updates the syllabus URL for a specific course.
	 * Corresponds to: POST /courses/syllabus
	 * Requires Professor permissions (likely tied to the course).
	 * @param syllabusData - Object containing courseId and the new syllabusUrl.
	 * @returns A promise that resolves with the syllabus upload confirmation.
	 */
	static async uploadSyllabus(
		syllabusData: UploadSyllabusRequest
	): Promise<UploadSyllabusResponse> {
		// NOTE: Swagger shows POST, but semantically this might be a PUT or PATCH if updating. Verify API behavior.
		return ApiService.post<UploadSyllabusResponse>('/courses/syllabus', syllabusData);
	}

	//  Methods for updating or deleting courses if those endpoints exist
}
