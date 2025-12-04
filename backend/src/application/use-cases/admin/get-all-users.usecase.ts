import { type IUserRepository } from "@/domain/repositories/index.js";
import { type UserListDto } from "@/application/dtos/user-list.dto.js";

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) { }

  public async execute(): Promise<UserListDto[]> {
    const users = await this.userRepository.findAll();

    return users.map((user) => ({
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      surname: user.surname,
      role: user.role,
      status: user.status,
    }));
  }
}
