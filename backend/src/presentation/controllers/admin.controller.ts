import { type Response, type NextFunction } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import {
  GetAdminStudentDetailsUseCase,
  GetAdminTeacherDetailsUseCase,
  type GetAllUsersUseCase
} from "@/application/use-cases/admin/index.js";
import { type GetAllLabGroupsWithSchedulesUseCase } from "@/application/use-cases/admin/get-all-lab-groups-with-schedules.usecase.js";

export const makeGetAllUsersController = (useCase: GetAllUsersUseCase) => {
  return async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const users = await useCase.execute();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };
};


export const makeGetAdminTeacherDetailsController = (useCase: GetAdminTeacherDetailsUseCase) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId, semester } = req.params;
      const details = await useCase.execute(userId as string, semester as string);
      return res.status(200).json(details);
    } catch (error) {
      next(error);
    }
  };
};

export const makeGetAdminStudentDetailsController = (useCase: GetAdminStudentDetailsUseCase) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId, semester } = req.params;
      const details = await useCase.execute(userId as string, semester as string);
      return res.status(200).json(details);
    } catch (error) {
      next(error);
    }
  };
};

export const makeGetAllLabGroupsWithSchedulesController = (useCase: GetAllLabGroupsWithSchedulesUseCase) => {
  return async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const labGroups = await useCase.execute();
      return res.status(200).json(labGroups);
    } catch (error) {
      next(error);
    }
  };
};
