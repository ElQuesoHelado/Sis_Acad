import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";

export class AuthenticationService {
  private userRepository = AppDataSource.getRepository(User);

  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return null;
      }

      const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordMatch) {
        return null;
      }

      return user;

    } catch (error: any) {
      throw new Error(`Error during authentication: ${error.message}`);
    }
  }
}
