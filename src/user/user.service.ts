import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomString } from 'src/utility/random';
import { MailService } from 'src/mail/mail.service';
import {
  PaginatedResult,
  PaginateFunction,
  paginator,
} from 'src/paginator/paginator';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  async findMany(
    filter: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<User>> {
    const paginate: PaginateFunction = paginator({ limit: limit });
    return paginate(
      this.prisma.user,
      {
        where: filter,
      },
      {
        page,
      },
    );
  }
  async getById(id: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }
  async create(data: User): Promise<User> {
    let password = '';
    if (data.password) {
      password = data.password;
    } else {
      password = randomString(10);
    }
    data.password = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: data,
    });
  }
  async update(id: number, data: User): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<User> {
    try {
      return this.prisma.user.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
  async findOneByEmail(email: string): Promise<User> {
    try {
      return this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
  async token_generate(email: string): Promise<User> {
    try {
      const token = randomString(20);
      const user = await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          token: token,
        },
      });
      //send RESET PASSWORD mail
      const email_response = this.mailService.generate_password(
        user.first_name + ' ' + user.last_name,
        email,
        token,
      );
      console.log(email_response);
      return user;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async token_validate(token: string): Promise<User> {
    try {
      console.log(token);
      const user = await this.prisma.user.findMany({
        where: {
          token: token,
        },
        take: 1,
      });
      return user[0];
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
  async password_reset(
    email: string,
    token: string,
    password: string,
  ): Promise<User> {
    try {
      let user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if ((user.token = token)) {
        user = await this.prisma.user.update({
          where: {
            email: email,
          },
          data: {
            password: await bcrypt.hash(password, 10),
          },
        });
      }

      return user;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
  async new_password_oneshot(): Promise<boolean> {
    // try {
    //send RESET PASSWORD mail
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          // in: [162, 53, 104, 161, 166, 170, 181, 204, 246, 262, 270, 271],
          in: [162],
        },
      },
    });
    console.log(users);
    for (const user of users) {
      const password = randomString(10);
      console.log('user: ' + user.email);
      console.log('new password: ' + password);
      const ans = await this.prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          password: await bcrypt.hash(password, 10),
        },
      });
      console.log(ans);
      //send RESET PASSWORD mail
      const email_response = await this.mailService.coordinator_new(
        user.email,
        password,
      );
      console.log(email_response);
    }
    return true;
    // } catch (error) {
    //   throw new NotFoundException('User not found');
    // }
  }
}
