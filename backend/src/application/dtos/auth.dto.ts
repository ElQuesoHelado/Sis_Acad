import type { UserRole } from "@/domain/enums/user-role.enum.js";

/**
 * Input DTO for a login request.
 * Contains the credentials submitted by the user.
 */
export interface LoginInputDto {
  /** User email */
  email: string;

  /** Plain-text password */
  password: string;
}

/**
 * Output DTO for a successful login response.
 * Contains the authentication token and user role.
 */
export interface LoginOutputDto {
  /** JWT or session token */
  token: string;

  /** Role of the authenticated user (e.g., STUDENT, TEACHER) */
  role: UserRole;

  /** ID of the associated profile (student or teacher) if applicable */
  profileId: string;
}
