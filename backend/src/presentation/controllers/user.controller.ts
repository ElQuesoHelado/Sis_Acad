import { type Response, type NextFunction } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import { type GetUserProfileUseCase } from "@/application/use-cases/user/get-user-profile.usecase.js";
import { UserNotFoundError } from "@/application/errors/user-not-found.error.js";

export const makeGetUserProfileController = (
  useCase: GetUserProfileUseCase,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.sub;

      const userProfile = await useCase.execute(userId);

      return res.status(200).json(userProfile);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({
          name: error.name,
          message: error.message,
        });
      }
      next(error);
    }
  };
};
