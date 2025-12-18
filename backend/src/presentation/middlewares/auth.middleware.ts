/**
 * @file Custom authentication/authorization middlewares.
 */
import { type Request, type Response, type NextFunction } from "express";
import {
  type IStudentProfileRepository,
  type ITeacherProfileRepository,
} from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";
import type { UserRole } from "@/domain/enums/user-role.enum.js";

/**
 * Extends the Express Request object to include auth information.
 * 'auth' is optional because it is added by the express-jwt middleware.
 */
export interface AuthRequest extends Request {
  auth?: {
    sub: string; // User ID
    role: UserRole;
    iat: number; // Issued at timestamp
    exp: number; // Expiration timestamp
    profileId?: string; // Profile ID added by middleware
  };
}

/**
 * Middleware factory to ensure the user has a specific role.
 * Returns 401 if no token, 403 if role does not match.
 */
export const ensureRole = (role: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({
        name: "UnauthorizedError",
        message: "No token provided or token is invalid.",
      });
    }

    if (req.auth.role !== role) {
      return res.status(403).json({
        name: "Forbidden",
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

/**
 * Middleware factory to load a student's profile ID from their user ID.
 * Attaches `profileId` to `req.auth` for downstream controllers.
 */
export const loadStudentProfile = (
  studentProfileRepo: IStudentProfileRepository,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.sub) {
        return res.status(401).json({
          name: "UnauthorizedError",
          message: "Invalid token data.",
        });
      }

      const userId = Id.create(req.auth.sub);
      const profile = await studentProfileRepo.findByUserId(userId);

      if (!profile) {
        return res.status(403).json({
          name: "Forbidden",
          message: "Student profile not found for this user.",
        });
      }

      req.auth.profileId = profile.id.value; // Attach profile ID
      next();
    } catch (error) {
      next(error); // Forward errors to global handler
    }
  };
};

/**
 * Middleware factory to *validate* that a user has a teacher profile.
 * It does NOT attach a profileId, as the `userId` (in `req.auth.sub`)
 * is the foreign key used in TheoryGroup and LabGroup.
 */
export const loadTeacherProfile = (
  teacherProfileRepo: ITeacherProfileRepository,
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.sub) {
        return res.status(401).json({
          name: "UnauthorizedError",
          message: "Invalid token data.",
        });
      }
      const userId = Id.create(req.auth.sub);
      const profile = await teacherProfileRepo.findByUserId(userId);

      if (!profile) {
        return res.status(403).json({
          name: "Forbidden",
          message: "Forbidden: Teacher profile not found for this user.",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const ensureRoles = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({
        name: "UnauthorizedError",
        message: "No token provided or token is invalid.",
      });
    }

    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({
        name: "Forbidden",
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};
