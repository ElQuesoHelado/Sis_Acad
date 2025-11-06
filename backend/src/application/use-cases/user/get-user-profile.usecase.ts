import { type IUserRepository } from "@/domain/repositories/iuser.repository.js";
import { Id } from "@/domain/value-objects/index.js";
import { type UserProfileDto } from "@/application/dtos/user-profile.dto.js";
import { UserNotFoundError } from "@/application/errors/user-not-found.error.js";

export class GetUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(userId: string): Promise<UserProfileDto> {
    const userIdVO = Id.create(userId);
    const user = await this.userRepository.findById(userIdVO);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return {
      name: user.name,
      surname: user.surname,
      email: user.email.value,
      role: user.role,
    };
  }
}
