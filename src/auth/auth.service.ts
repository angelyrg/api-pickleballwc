import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SigninInput } from './dto/inputs';
import { AuthResponse, SignInResponse } from './types/auth-response.type';
import { UserService } from 'src/user/user.service';
import { MemberService } from 'src/member/member.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly memberService: MemberService,
    private readonly jwtService: JwtService,
  ) {}

  /*
  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    const user = await this.userService.create(signupInput);

    const access_token = await this.getJwtToken(user.id);

    return {
      access_token,
      user,
    };
  }
  */

  async signin(signinInput: SigninInput): Promise<SignInResponse> {
    const { email, password } = signinInput;

    const user = await this.userService.findOneByEmail(email);
    const member = await this.memberService.getByUserId(user.id);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Email or password are invalid');
    }

    const access_token = await this.getJwtToken(user.id);

    return {
      access_token,
      user,
      member: member || null,
    };
  }

  async revalidateToken(user: User): Promise<AuthResponse> {
    const access_token = await this.getJwtToken(user.id);

    return {
      access_token,
      user,
    };
  }

  async validateUser(id: number): Promise<User> {
    const user = await this.userService.getById(id);
    //if (!user.isActive)
    //  throw new UnauthorizedException('User is inactive, contact admin');
    user.password = undefined;

    return user;
  }

  private async getJwtToken(userId: number) {
    const access_token = await this.jwtService.signAsync({ id: userId });
    return access_token;
  }
}
