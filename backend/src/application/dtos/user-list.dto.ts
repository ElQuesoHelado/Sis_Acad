import { UserRole } from "@/domain/enums/user-role.enum.js";

export interface UserListDto {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: UserRole;
  status: boolean;
}
