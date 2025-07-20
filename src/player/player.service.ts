import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Player, Member, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomString } from 'src/utility/random';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PlayerService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getAll(): Promise<Player[]> {
    return this.prisma.player.findMany();
  }
  async getById(id: number): Promise<Player> {
    return this.prisma.player.findUnique({
      where: {
        id: id,
      },
    });
  }
  async create(data: {
    user: User;
    member: Member;
    player: Player;
  }): Promise<Player> {
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

    const player = await this.prisma.player.upsert({
      where: {
        team_id_member_id: {
          member_id: member.id,
          team_id: data.player.team_id,
        },
      },
      update: { ...data.player, member_id: member.id },
      create: { ...data.player, member_id: member.id },
    });

    const email_response = this.mailService.welcome_player(
      user.first_name + ' ' + user.last_name,
      member.country,
      user.email,
      password,
    );
    console.log(email_response);
    return player;
  }
  async update(id: number, data: Player): Promise<Player> {
    return this.prisma.player.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<Player> {
    return this.prisma.player.delete({
      where: {
        id: id,
      },
    });
  }
  async assign(data: { member_id: number; team_id: number }): Promise<Player> {
    return this.prisma.player.upsert({
      where: {
        team_id_member_id: {
          member_id: data.member_id,
          team_id: data.team_id,
        },
      },
      update: {
        member_id: data.member_id,
        team_id: data.team_id,
      },
      create: {
        member_id: data.member_id,
        team_id: data.team_id,
      },
    });
  }
}
