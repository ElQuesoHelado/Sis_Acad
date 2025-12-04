import { type Response, type NextFunction } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import { type GetAllUsersUseCase } from "@/application/use-cases/admin/index.js";

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
