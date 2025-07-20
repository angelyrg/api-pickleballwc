import { UserRoles } from 'src/user/enums/roles.enums';

export class SignupInput {
  name: string;
  email: string;
  password: string;
  rol?: UserRoles;
  photo?: string;
  isActive?: boolean;
  companyId: number;
}
