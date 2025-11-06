import { type IUserRepository } from "@/domain/repositories/iuser.repository.js";
import type { Id } from "@/domain/value-objects/index.js";
import { Email } from "@/domain/value-objects/index.js";
import {
  type LoginInputDto,
  type LoginOutputDto,
} from "@/application/dtos/auth.dto.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";
import { type IStudentProfileRepository } from "@/domain/repositories/istudent-profile.repository.js";
import { type ITeacherProfileRepository } from "@/domain/repositories/iteacher-profile.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "@/infraestructure/config/index.js";
import { UserRole } from "@/domain/enums/user-role.enum.js";

const JWT_EXPIRATION = "1h";
const JWT_ALGORITHM = "HS256";

/**
 * Use Case: Authenticates a user and issues a JWT token.
 *
 * Responsibilities:
 * 1. Validate user credentials.
 * 2. Verify user is active.
 * 3. Fetch associated profile ID (student or professor).
 * 4. Generate a signed JWT token.
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly studentProfileRepository: IStudentProfileRepository,
    private readonly teacherProfileRepository: ITeacherProfileRepository,
  ) {}

  /**
   * Executes the login flow.
   * @param input - Login credentials
   * @returns JWT token, role, and associated profile ID
   * @throws NotAuthorizedError if credentials are invalid or user inactive
   */
  public async execute(input: LoginInputDto): Promise<LoginOutputDto> {
    const emailVO = Email.create(input.email);

    const user = await this.userRepository.findByEmail(emailVO);
    if (!user || !user.status) {
      throw new NotAuthorizedError("Invalid credentials or user inactive.");
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);
    if (!passwordMatch) {
      throw new NotAuthorizedError("Invalid credentials or user inactive.");
    }

    let profileId: Id | null = null;
    if (user.role === UserRole.STUDENT) {
      const profile = await this.studentProfileRepository.findByUserId(user.id);
      profileId = profile?.id ?? null;
    } else if (user.role === UserRole.PROFESSOR) {
      const profile = await this.teacherProfileRepository.findByUserId(user.id);
      profileId = profile?.id ?? null;
    }

    if (!profileId) {
      console.warn(
        `User ${user.id.value} is a ${user.role} but has no profile.`,
      );
    }

    const token = jwt.sign(
      {
        sub: user.id.value,
        role: user.role,
        profileId: profileId?.value,
      },
      env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION, algorithm: JWT_ALGORITHM },
    );

    return {
      token,
      role: user.role,
      profileId: profileId?.value ?? "",
    };
  }
}
