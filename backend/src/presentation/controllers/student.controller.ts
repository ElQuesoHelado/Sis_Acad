/**
 * @file Controllers for the Student module.
 * Maps HTTP requests to application use cases.
 */
import { type Response, type NextFunction } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import {
  type GetStudentGradesBySemesterUseCase,
  type GetStudentScheduleUseCase,
  type GetAvailableLabGroupsUseCase,
  type EnrollInLabGroupUseCase,
  type EnrollInLabGroupsUseCase,
  type GetStudentCoursesBySemesterUseCase,
} from "@/application/use-cases/student/index.js";
import { DomainError } from "@/domain/errors/index.js";
import {
  BulkEnrollmentError,
  EnrollmentNotFoundError,
} from "@/domain/errors/enrollment.errors.js";
import { LabGroupNotFoundError } from "@/domain/errors/lab.errors.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";
import type { GetStudentCourseProgressUseCase } from "@/application/use-cases/student/get-course-progress.usecase.js";

/**
 * Factory to create the controller for getting student's enrolled courses.
 */
export const makeGetStudentCoursesController = (
  useCase: GetStudentCoursesBySemesterUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentProfileId = req.auth?.profileId;
      if (!studentProfileId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Missing profile ID" });
      }
      const { semester } = req.params;

      const courses = await useCase.execute(
        studentProfileId,
        semester as string,
      );
      return res.status(200).json(courses);
    } catch (error) {
      if (error instanceof DomainError) {
        return res
          .status(400)
          .json({ name: error.constructor.name, message: error.message });
      }
      next(error);
    }
  };
};

/**
 * Factory to create the controller for getting student grades.
 */
export const makeGetStudentGradesController = (
  useCase: GetStudentGradesBySemesterUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentProfileId = req.auth?.profileId;
      if (!studentProfileId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Missing profile ID" });
      }

      const { semester } = req.params;

      const courseGrades = await useCase.execute(
        studentProfileId,
        semester as string,
      );

      return res.status(200).json(courseGrades);
    } catch (error) {
      if (error instanceof DomainError) {
        return res
          .status(400)
          .json({ name: error.constructor.name, message: error.message });
      }
      next(error);
    }
  };
};

/**
 * Factory to create the controller for getting student schedule.
 */
export const makeGetStudentScheduleController = (
  useCase: GetStudentScheduleUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentProfileId = req.auth?.profileId;
      if (!studentProfileId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Missing profile ID" });
      }
      const { semester } = req.params;

      const schedule = await useCase.execute(
        studentProfileId,
        semester as string,
      );
      return res.status(200).json(schedule);
    } catch (error) {
      if (error instanceof DomainError) {
        return res
          .status(400)
          .json({ name: error.constructor.name, message: error.message });
      }
      next(error);
    }
  };
};

/**
 * Factory to create the controller for getting available lab groups.
 */
export const makeGetAvailableLabGroupsController = (
  useCase: GetAvailableLabGroupsUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentProfileId = req.auth?.profileId;
      if (!studentProfileId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Missing profile ID" });
      }
      const { enrollmentId } = req.params;

      const labs = await useCase.execute(
        studentProfileId,
        enrollmentId as string,
      );
      return res.status(200).json(labs);
    } catch (error) {
      if (error instanceof EnrollmentNotFoundError) {
        return res
          .status(404)
          .json({ name: error.name, message: error.message });
      }
      if (error instanceof NotAuthorizedError) {
        return res
          .status(403)
          .json({ name: error.name, message: error.message });
      }
      if (error instanceof DomainError) {
        return res
          .status(400)
          .json({ name: error.name, message: error.message });
      }
      next(error);
    }
  };
};

/**
 * Factory for the *singular* lab group enrollment controller.
 */
export const makeEnrollInLabGroupController = (
  useCase: EnrollInLabGroupUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentProfileId = req.auth?.profileId;
      if (!studentProfileId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Missing profile ID" });
      }

      const { enrollmentId, labGroupId } = req.body;
      if (!enrollmentId || !labGroupId) {
        return res
          .status(400)
          .json({ message: "Missing enrollmentId or labGroupId" });
      }

      await useCase.execute({
        studentProfileId,
        enrollmentId,
        labGroupId,
      });

      return res.status(200).json({
        success: true,
        message: "Successfully enrolled in lab group.",
      });
    } catch (error) {
      if (
        error instanceof EnrollmentNotFoundError ||
        error instanceof LabGroupNotFoundError
      ) {
        return res
          .status(404)
          .json({ name: error.name, message: error.message });
      }
      if (error instanceof NotAuthorizedError) {
        return res
          .status(403)
          .json({ name: error.name, message: error.message });
      }
      if (error instanceof DomainError) {
        // Catches LabGroupFullError, CourseMismatchError, etc.
        return res
          .status(409)
          .json({ name: error.name, message: error.message });
      }
      next(error);
    }
  };
};

/**
 * Factory for the *bulk* (plural) lab group enrollment controller.
 */
export const makeEnrollInLabGroupsController = (
  useCase: EnrollInLabGroupsUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentProfileId = req.auth?.profileId;
      if (!studentProfileId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Missing profile ID" });
      }

      const { selections } = req.body;
      if (!Array.isArray(selections) || selections.length === 0) {
        return res
          .status(400)
          .json({ message: "Request body must contain a 'selections' array." });
      }

      await useCase.execute(studentProfileId, selections);

      return res.status(200).json({
        success: true,
        message: "Successfully enrolled in all selected lab groups.",
      });
    } catch (error) {
      if (
        error instanceof EnrollmentNotFoundError ||
        error instanceof LabGroupNotFoundError
      ) {
        return res
          .status(404)
          .json({ name: error.name, message: error.message });
      }
      if (error instanceof NotAuthorizedError) {
        return res
          .status(403)
          .json({ name: error.name, message: error.message });
      }
      if (error instanceof BulkEnrollmentError) {
        return res.status(409).json({
          name: error.name,
          message: `Enrollment failed: ${error.message} The entire operation was rolled back.`,
        });
      }
      if (error instanceof DomainError) {
        return res
          .status(409)
          .json({ name: error.name, message: error.message });
      }
      next(error);
    }
  };
};

export const makeGetCourseProgressController = (
  useCase: GetStudentCourseProgressUseCase
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentProfileId = req.auth?.profileId;
      if (!studentProfileId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { enrollmentId } = req.params;

      const progress = await useCase.execute(studentProfileId, enrollmentId as string);

      return res.status(200).json(progress);
    } catch (error) {
      next(error);
    }
  };
};
