import { Member, User } from '@prisma/client';

export class AuthResponse {
  access_token: string;
  user: User;
}

export class SignInResponse {
  access_token: string;
  user: User;
  member: Member | null;
}
