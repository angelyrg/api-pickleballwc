import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Support, Member, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomString } from 'src/utility/random';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getAll(): Promise<Support[]> {
    return this.prisma.support.findMany();
  }
  async getById(id: number): Promise<Support> {
    return this.prisma.support.findUnique({
      where: {
        id: id,
      },
    });
  }
  async create(data: {
    user: User;
    member: Member;
    support: Support;
  }): Promise<Support> {
    const already_exists = await this.prisma.user.count({
      where: { email: data.user.email },
    });
    let password = '';
    if (data.user.password) {
      password = data.user.password;
    } else if (already_exists > 0) {
      password = randomString(10);
    }

    if (password) data.user.password = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.upsert({
      where: { email: data.user.email },
      update: data.user,
      create: data.user,
    });

    const member = await this.prisma.member.upsert({
      where: { user_id: user.id },
      update: { ...data.member, user_id: user.id },
      create: { ...data.member, user_id: user.id },
    });

    const support = await this.prisma.support.upsert({
      where: {
        team_id_member_id: {
          member_id: member.id,
          team_id: data.support.team_id,
        },
      },
      update: { ...data.support, member_id: member.id },
      create: { ...data.support, member_id: member.id },
    });

    const email_response = this.mailService.welcome_support(
      user.first_name + ' ' + user.last_name,
      member.country,
      user.email,
      password,
    );
    console.log(email_response);
    return support;
  }
  async update(id: number, data: Support): Promise<Support> {
    return this.prisma.support.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<Support> {
    return this.prisma.support.delete({
      where: {
        id: id,
      },
    });
  }
}
