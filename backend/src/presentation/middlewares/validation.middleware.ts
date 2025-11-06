import { type Request, type Response, type NextFunction } from "express";
import type { ZodObject } from "zod";
import { ZodError, treeifyError } from "zod";

/**
 * Express middleware to validate incoming requests using a Zod schema.
 *
 * It validates `req.body`, `req.query`, and `req.params` against the provided schema.
 * If validation passes, `next()` is called. Otherwise, a 400 response is sent
 * with detailed validation errors.
 *
 * @param schema - The ZodObject schema to validate the request against.
 * @returns Express middleware function
 */
export const validate =
  (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          name: "ValidationError",
          message: "Invalid request data.",
          details: treeifyError(error).errors,
        });
      }

      // For unexpected errors
      return res.status(500).json({
        name: "InternalServerError",
        message: "An unexpected error occurred during validation.",
      });
    }
  };
