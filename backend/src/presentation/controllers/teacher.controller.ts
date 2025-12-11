import { type Response, type NextFunction } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import type { TakeAttendanceUseCase } from "@/application/use-cases/teacher/take-attendance.usecase.js";
import {
  DomainError,
  ReservationConflictError,
  ReservationLimitError,
  ReservationWindowError,
} from "@/domain/errors/index.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";
import { type ClassType } from "@/domain/enums/index.js";
import type { GetStudentRosterUseCase } from "@/application/use-cases/teacher/get-student-roster.usecase.js";
import type { GetTeacherScheduleUseCase } from "@/application/use-cases/teacher/get-teacher-schedule.usecase.js";
import type { GetTeacherGroupsUseCase } from "@/application/use-cases/teacher/get-teacher-groups.usecase.js";
import type { SaveBulkGradesUseCase } from "@/application/use-cases/teacher/save-bulk-grades.usecase.js";
import type { GetStudentRosterWithGradesUseCase } from "@/application/use-cases/teacher/get-student-roster-with-grades.usecase.js";
import type { CreateRoomReservationUseCase } from "@/application/use-cases/index.js";
import type { SaveGroupEvidenceUseCase } from "@/application/use-cases/teacher/save-group-evidence.usecase.js";
import type { GetAccreditationDashboardUseCase } from "@/application/use-cases/teacher/get-accreditation-dashboard.usecase.js";
import type { UpdateTopicStatusUseCase } from "@/application/use-cases/teacher/update-topic-status.usecase.js";
import type { GetCourseContentByGroupUseCase } from "@/application/use-cases/teacher/get-course-content.usecase.js";

export const makeTakeAttendanceController = (
  useCase: TakeAttendanceUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacherUserId = req.auth!.sub;

      const { classType, groupId, date, records } = req.body;

      await useCase.execute({
        teacherUserId,
        classType,
        groupId,
        date,
        records,
      });

      return res.status(200).json({
        success: true,
        message: "Attendance recorded successfully.",
      });
    } catch (error) {
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

export const makeGetTeacherScheduleController = (
  useCase: GetTeacherScheduleUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacherUserId = req.auth!.sub;
      const { semester } = req.params;
      const { date } = req.query;

      const schedule = await useCase.execute(teacherUserId, semester as string, date as string | undefined);
      return res.status(200).json(schedule);
    } catch (error) {
      if (error instanceof DomainError) {
        return res
          .status(400)
          .json({ name: error.name, message: error.message });
      }
      next(error);
    }
  };
};

export const makeGetStudentRosterController = (
  useCase: GetStudentRosterUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacherUserId = req.auth!.sub;
      const { groupId } = req.params;
      const { type } = req.query;

      const roster = await useCase.execute(
        teacherUserId,
        groupId as string,
        type as ClassType,
      );
      return res.status(200).json(roster);
    } catch (error) {
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

export const makeGetTeacherGroupsController = (
  useCase: GetTeacherGroupsUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacherUserId = req.auth!.sub;
      const { semester } = req.params;

      const groups = await useCase.execute(teacherUserId, semester as string);
      return res.status(200).json(groups);
    } catch (error) {
      if (error instanceof DomainError) {
        return res
          .status(400)
          .json({ name: error.name, message: error.message });
      }
      next(error);
    }
  };
};

export const makeGetStudentRosterWithGradesController = (
  useCase: GetStudentRosterWithGradesUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacherUserId = req.auth!.sub;
      const { groupId } = req.params;
      const { type } = req.query;

      const roster = await useCase.execute(
        teacherUserId,
        groupId as string,
        type as ClassType,
      );
      return res.status(200).json(roster);
    } catch (error) {
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

export const makeSaveBulkGradesController = (
  useCase: SaveBulkGradesUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teacherUserId = req.auth!.sub;
      const { classType, groupId, entries } = req.body;

      await useCase.execute({
        teacherUserId,
        classType,
        groupId,
        entries,
      });

      return res.status(200).json({
        success: true,
        message: "Grades saved successfully.",
      });
    } catch (error) {
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
 *  Factory for the Create Room Reservation controller.
 * @param useCase - An instance of CreateRoomReservationUseCase.
 * @returns An Express request handler.
 */
export const makeCreateReservationController = (
  useCase: CreateRoomReservationUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const professorId = req.auth!.sub;
      const reservationDto = req.body;

      const newReservation = await useCase.execute(reservationDto, professorId);

      return res.status(201).json(newReservation);
    } catch (error) {
      if (
        error instanceof ReservationConflictError ||
        error instanceof ReservationLimitError ||
        error instanceof ReservationWindowError
      ) {
        return res.status(409).json({
          name: error.name,
          message: error.message,
        });
      }
      if (error instanceof NotAuthorizedError) {
        return res
          .status(403)
          .json({ name: error.name, message: error.message });
      }
      if (error instanceof DomainError) {
        return res.status(400).json({
          name: error.name,
          message: error.message,
        });
      }
      next(error);
    }
  };
};

export const makeGetAccreditationDashboardController = (
  useCase: GetAccreditationDashboardUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({ message: "Group ID is required" });
      }

      const data = await useCase.execute(groupId);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };
};

export const makeUploadEvidenceController = (
  useCase: SaveGroupEvidenceUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.params;
      const { type } = req.body;
      const file = req.file;

      if (!groupId) {
        return res.status(400).json({ message: "Group ID is required" });
      }

      if (!file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

      await useCase.execute(
        groupId,
        type as "low" | "avg" | "high" | "syllabus",
        fileUrl
      );

      return res.status(200).json({ success: true, url: fileUrl });
    } catch (error) {
      next(error);
    }
  };
};


export const makeGetCourseContentController = (useCase: GetCourseContentByGroupUseCase) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
          return res.status(400).json({message: "No groupId provided."})
        }
        const topics = await useCase.execute(groupId);
        return res.status(200).json(topics);
    } catch (error) { next(error); }
  };
};

export const makeUpdateTopicStatusController = (
  useCase: UpdateTopicStatusUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { topicId } = req.params;
      const { status } = req.body;

      if (!topicId) {
        return res.status(400).json({ message: "No topic id provided." });
      }

      await useCase.execute(topicId, status);

      return res.status(200).json({ success: true, message: "Topic updated." });
    } catch (error) {
      next(error);
    }
  };
};
