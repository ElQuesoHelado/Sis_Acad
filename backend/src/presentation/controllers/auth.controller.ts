import { type Response, type NextFunction, type Request } from "express";
import { type LoginUseCase } from "@/application/use-cases/auth/login.usecase.js";
import { DomainError } from "@/domain/errors/index.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";

/**
 * Factory function to create a login controller.
 *
 * @param useCase - Instance of LoginUseCase
 * @returns Express handler function
 */
export const makeLoginController = (useCase: LoginUseCase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const output = await useCase.execute({ email, password });

      return res.status(200).json(output);
    } catch (error) {
      if (error instanceof NotAuthorizedError) {
        return res.status(401).json({
          name: error.name,
          message: error.message,
        });
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
