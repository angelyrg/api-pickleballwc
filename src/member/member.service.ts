import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Member, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import {
  PaginatedResult,
  PaginateFunction,
  paginator,
} from 'src/paginator/paginator';
import { randomString } from 'src/utility/random';
import { TeamService } from 'src/team/team.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MemberService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private teamService: TeamService,
  ) {}

  async getAll() {
    return this.prisma.member.findMany({
      include: {
        user: true,
      },
    });
  }
  async findMany(
    filter: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Member>> {
    const paginate: PaginateFunction = paginator({ limit: limit });
    return paginate(
      this.prisma.member,
      {
        where: filter,
        include: {
          user: true,
        },
        orderBy: {
          country: 'asc',
        },
      },
      {
        page,
      },
    );
  }
  async getById(id: number): Promise<Member> {
    return this.prisma.member.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        coordinated: true,
      },
    });
  }
  async create(data: {
    user: User;
    member: Member;
    tournaments?: number[];
  }): Promise<Member> {
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
    const user = await this.prisma.user
      .upsert({
        where: { email: data.user.email },
        update: data.user,
        create: data.user,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            const target = (error.meta as { target?: string[] | string })
              ?.target;

            if (
              target === 'User_email_key' ||
              (Array.isArray(target) && target.includes('email'))
            ) {
              throw new Error('USER-EMAIL-EXISTS');
            }
          }
        }
        throw error;
      });

    const member = await this.prisma.member.upsert({
      where: { user_id: user.id },
      update: { ...data.member, user_id: user.id },
      create: { ...data.member, user_id: user.id },
    });

    if (data.tournaments) {
      const tournaments = [];
      for (const tournamentId of data.tournaments) {
        tournaments.push(
          this.teamService.create({
            tournament_id: tournamentId,
            coordinator_id: member.id,
            country: member.country,
            country_code: member.country_code,
          }),
        );

        await Promise.all(tournaments);
      }
    }

    if (member.is_coordinator) {
      this.mailService.welcome_coordinator(
        user.first_name + ' ' + user.last_name,
        user.email,
        password,
      );
    } else {
      this.mailService.welcome_player(
        user.first_name + ' ' + user.last_name,
        member.country,
        user.email,
        password,
      );
    }
    return member;
  }
  async update(
    id: number,
    data: { user: User; member: Member; tournaments?: number[] },
  ): Promise<Member> {
    if (data.user.password)
      data.user.password = await bcrypt.hash(data.user.password, 10);

    const member = await this.prisma.member.update({
      where: { id },
      data: data.member,
    });

    await this.prisma.user
      .update({
        where: { id: member.user_id },
        data: data.user,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            const target = (error.meta as { target?: string[] | string })
              ?.target;

            if (
              target === 'User_email_key' ||
              (Array.isArray(target) && target.includes('email'))
            ) {
              throw new Error('USER-EMAIL-EXISTS');
            }
          }
        }
        throw error;
      });

    if (data.tournaments) {
      const tournaments = [];
      for (const tournamentId of data.tournaments) {
        tournaments.push(
          this.teamService.create({
            tournament_id: tournamentId,
            coordinator_id: member.id,
            country: member.country,
            country_code: member.country_code,
          }),
        );

        await Promise.all(tournaments);
      }
    }

    return member;
  }
  async delete(id: number): Promise<Member> {
    const member = await this.prisma.member.findUnique({
      where: { id: id },
      include: { user: true },
    });

    await this.prisma.member.delete({
      where: {
        id: id,
      },
    });
    await this.prisma.user.delete({
      where: { id: member.user.id },
    });

    return member;
  }
  async getByUserId(id: number): Promise<Member | null> {
    const member = this.prisma.member.findUnique({
      where: {
        user_id: id,
      },
    });
    return member || null;
  }
}
