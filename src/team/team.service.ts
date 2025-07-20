import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Member, Prisma, Team, TeamStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import {
  PaginatedResult,
  PaginateFunction,
  paginator,
} from 'src/paginator/paginator';
import { SendMailDto } from './dto/send-mail';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getAll(
    filter: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Team>> {
    const paginate: PaginateFunction = paginator({ limit: limit });
    return paginate(
      this.prisma.team,
      {
        where: filter,
        include: {
          tournament: true,
          coordinator: {
            include: {
              user: true,
            },
          },
          reserve: true,
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
  async getById(id: number): Promise<Team> {
    return this.prisma.team.findUnique({
      where: {
        id: id,
      },
      include: {
        tournament: true,
        reserve: true,
      },
    });
  }
  async create(data: Prisma.TeamUncheckedCreateInput): Promise<Team> {
    return this.prisma.team.create({
      data: data,
    });
  }
  async update(id: number, data: Team): Promise<Team> {
    return this.prisma.team.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<Team> {
    return this.prisma.team.delete({
      where: {
        id: id,
      },
    });
  }
  async getCoordinatedTeams(member_id: number): Promise<Team[]> {
    return this.prisma.team.findMany({
      where: {
        coordinator_id: member_id,
      },
      include: {
        tournament: true,
        reserve: true,
      },
    });
  }
  async getPlayedTeams(member_id: number): Promise<Team[]> {
    return this.prisma.team.findMany({
      where: {
        players: {
          some: {
            member_id: member_id,
          },
        },
      },
      include: {
        tournament: true,
        reserve: true,
      },
    });
  }
  async detail(id: number): Promise<Team> {
    return this.prisma.team.findUnique({
      where: { id: id },
      include: {
        tournament: true,
        coach: {
          include: {
            user: true,
          },
        },
        coordinator: {
          include: {
            user: true,
          },
        },
        captain: {
          include: {
            user: true,
          },
        },
        players: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
        supports: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
        reserve: true,
      },
    });
  }
  async token_update(id: number, secret_token: string): Promise<boolean> {
    const team = await this.prisma.team.update({
      where: {
        id: id,
      },
      data: {
        payment_token: secret_token,
      },
    });
    if (team) return true;
    else return false;
  }
  async token_validate(id: number, token: string): Promise<boolean> {
    const team = await this.prisma.team.findUnique({
      where: {
        id: id,
      },
    });

    return team.payment_token == token;
  }
  async status_update(id: number, status: TeamStatus): Promise<Team> {
    const team = await this.prisma.team.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
    return team;
  }

  async set_tournaments(member: Member): Promise<any> {
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        active: true,
      },
    });
    const team_data = [];
    for (const tournament of tournaments) {
      team_data.push({
        coordinator_id: member.id,
        country_code: member.country,
        tournament_id: tournament.id,
      });
    }
    const teams = await this.prisma.team.createMany({
      data: team_data,
    });

    return teams;
  }
  async exportToExcel() {
    const teams = await this.prisma.team.findMany({
      include: {
        tournament: true,
        coordinator: {
          include: {
            user: true,
          },
        },
        coach: {
          include: {
            user: true,
          },
        },
        captain: {
          include: {
            user: true,
          },
        },
        players: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
        supports: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
        reserve: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Teams Data');

    const question1 = 'What is your best experience or anecdote on the court?';
    const question2 = 'What do you like most about Pickleball?';
    const question3 = 'What is your dream?';
    sheet.columns = [
      { header: 'N', key: 'number', width: 10 },
      { header: 'Nombre', key: 'member_name', width: 30 },
      { header: 'Apellido', key: 'member_lastname', width: 30 },
      { header: 'Email', key: 'member_email', width: 30 },
      { header: 'Género', key: 'member_gender', width: 30 },
      { header: 'Telefono', key: 'member_phone', width: 30 },
      { header: 'Cargo', key: 'member_position', width: 10 },
      { header: 'Support', key: 'member_support', width: 10 },
      { header: 'Categoria', key: 'team_category', width: 20 },
      { header: 'Status', key: 'team_status', width: 30 },
      { header: 'dupr', key: 'member_dupr', width: 30 },
      { header: 'shirt_size', key: 'member_shirt', width: 15 },
      { header: 'pais', key: 'country', width: 30 },
      { header: 'fecha de nacimiento', key: 'member_birthday', width: 30 },
      { header: 'pasaporte', key: 'member_passport', width: 30 },
      { header: 'Aerolinea', key: 'member_airline', width: 30 },
      { header: 'Número de vuelo', key: 'member_flight', width: 30 },
      { header: 'Fecha de llegada', key: 'member_arrival', width: 30 },
      // { header: '# Habitaciones', key: 'reserve_qty', width: 20 },
      // { header: 'Reserve Start', key: 'reserve_start', width: 20 },
      // { header: 'Reserve End', key: 'reserve_end', width: 20 },
      { header: question1, key: 'member_question1', width: 30 },
      { header: question2, key: 'member_question2', width: 30 },
      { header: question3, key: 'member_question3', width: 30 },
    ];
    console.log(teams);
    let i = 0;
    teams.forEach((team) => {
      //coordinator_data:
      // coordinator: `${team.coordinator.user.first_name} ${team.coordinator.user.last_name}`,
      //coach_data:
      // coach: team.coach
      //   ? `${team.coach.user.first_name} ${team.coach.user.last_name}`
      //   : 'N/A',
      // captain_data
      // captain: team.captain
      //   ? `${team.captain.user.first_name} ${team.captain.user.last_name}`
      //   : 'N/A',
      // SET COORDINATOR DATA:
      if (team.coordinator) {
        i++;
        const data = {
          number: i,
          member_name: team.coordinator.user.first_name,
          member_lastname: team.coordinator.user.last_name,
          member_email: team.coordinator.user.email,
          member_gender: team.coordinator.gender,
          member_phone:
            (team.coordinator.phone_code ? team.coordinator.phone_code : '') +
            (team.coordinator.phone_number
              ? ' ' + team.coordinator.phone_number
              : ''),
          member_position: 'COORDINATOR',
          country: team.country,
          member_dupr: team.coordinator.dupr_alphanumeric,
          member_shirt: team.coordinator.shirt_size
            ? team.coordinator.shirt_size
            : '',
          // member_country: team.coordinator.country,
          member_birthday: team.coordinator.birthday,
          member_passport: team.coordinator.passport,
          member_airline: team.coordinator.airline,
          member_flight: team.coordinator.flight,
          member_arrival: team.coordinator.arrival,
          team_status: team.status,
          team_category: team.tournament.name,
          // reserve_qty: team.reserve ? team.reserve.qty : '',
          // reserve_start: team.reserve ? team.reserve.start : '',
          // reserve_end: team.reserve ? team.reserve.end : '',
          member_question1: team.coordinator.question1,
          member_question2: team.coordinator.question2,
          member_question3: team.coordinator.question3,
        };
        // console.log(data);
        sheet.addRow(data);
      }
      // SET COACH DATA
      if (team.coach) {
        i++;
        const data = {
          number: i,
          member_name: team.coach.user.first_name,
          member_lastname: team.coach.user.last_name,
          member_email: team.coach.user.email,
          member_gender: team.coach.gender,
          member_phone:
            (team.coach.phone_code ? team.coach.phone_code : '') +
            (team.coach.phone_number ? ' ' + team.coach.phone_number : ''),
          member_position: 'COACH',
          member_dupr: team.coach.dupr_alphanumeric,
          member_shirt: team.coach.shirt_size ? team.coach.shirt_size : '',
          member_birthday: team.coach.birthday,
          member_passport: team.coach.passport,
          member_airline: team.coach.airline,
          member_flight: team.coach.flight,
          member_arrival: team.coach.arrival,
          country: team.country,
          //team_status: team.status,
          member_question1: team.coach.question1,
          member_question2: team.coach.question2,
          member_question3: team.coach.question3,
        };
        // console.log(data);
        sheet.addRow(data);
      }
      // SET CAPTAIN DATA
      if (team.captain) {
        i++;
        const data = {
          number: i,
          member_name: team.captain.user.first_name,
          member_lastname: team.captain.user.last_name,
          member_email: team.captain.user.email,
          member_gender: team.captain.gender,
          member_phone:
            (team.captain.phone_code ? team.captain.phone_code : '') +
            (team.captain.phone_number ? ' ' + team.captain.phone_number : ''),
          member_position: 'CAPTAIN',
          member_dupr: team.captain.dupr_alphanumeric,
          member_shirt: team.captain.shirt_size ? team.captain.shirt_size : '',
          member_birthday: team.captain.birthday,
          member_passport: team.captain.passport,
          member_airline: team.captain.airline,
          member_flight: team.captain.flight,
          member_arrival: team.captain.arrival,
          country: team.country,
          //team_status: team.status,
          team_category: team.tournament.name,
          member_question1: team.captain.question1,
          member_question2: team.captain.question2,
          member_question3: team.captain.question3,
        };
        // console.log(data);
        sheet.addRow(data);
      }
      // SET SUPPORTS DATA
      team.players.forEach((player) => {
        i++;
        const data = {
          number: i,
          member_name: player.member.user.first_name,
          member_lastname: player.member.user.last_name,
          member_email: player.member.user.email,
          member_gender: player.member.gender,
          member_phone:
            (player.member.phone_code ? player.member.phone_code : '') +
            (player.member.phone_number
              ? ' ' + player.member.phone_number
              : ''),
          member_position: 'PLAYER',
          member_dupr: player.member.dupr_alphanumeric,
          member_shirt: player.member.shirt_size
            ? player.member.shirt_size
            : '',
          member_birthday: player.member.birthday,
          member_passport: player.member.passport,
          member_airline: player.member.airline,
          member_flight: player.member.flight,
          member_arrival: player.member.arrival,
          country: team.country,
          //team_status: team.status,
          team_category: team.tournament.name,
          member_question1: player.member.question1,
          member_question2: player.member.question2,
          member_question3: player.member.question3,
        };
        // console.log(data);
        sheet.addRow(data);
      });
      // SET PLAYERS DATA
      team.supports.forEach((support) => {
        i++;
        const data = {
          number: i,
          member_name: support.member.user.first_name,
          member_lastname: support.member.user.last_name,
          member_email: support.member.user.email,
          member_gender: support.member.gender,
          member_phone:
            (support.member.phone_code ? support.member.phone_code : '') +
            (support.member.phone_number
              ? ' ' + support.member.phone_number
              : ''),
          member_position: 'SUPPORT',
          member_support: support.member.position,
          member_dupr: support.member.dupr_alphanumeric,
          member_shirt: support.member.shirt_size
            ? support.member.shirt_size
            : '',
          // member_country: support.member.country,
          member_birthday: support.member.birthday,
          member_passport: support.member.passport,
          member_airline: support.member.airline,
          member_flight: support.member.flight,
          member_arrival: support.member.arrival,
          country: team.country,
          //team_status: team.status,
          team_category: team.tournament.name,
          member_question1: support.member.question1,
          member_question2: support.member.question2,
          member_question3: support.member.question3,
        };
        // console.log(data);
        sheet.addRow(data);
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
  }

  async sendTo(data: SendMailDto) {
    const emails = new Set<string>();

    if (data.type == 'all') {
      const allRelevantUsers = await this.prisma.user.findMany({
        where: {
          member: {
            is: {
              OR: [
                { is_coordinator: true },
                { coached: { some: {} } },
                { captained: { some: {} } },
                { players: { some: {} } },
                { supports: { some: {} } },
              ],
            },
          },
        },
        select: {
          email: true,
        },
      });
      allRelevantUsers.forEach(({ email }) => emails.add(email));
    } else if (data.type == 'coordinators') {
      const coordinators = await this.prisma.user.findMany({
        where: {
          member: {
            is: {
              is_coordinator: true,
            },
          },
        },
        select: {
          email: true,
        },
      });
      coordinators.forEach(({ email }) => emails.add(email));
    } else if (data.type == 'coachs') {
      const coachs = await this.prisma.user.findMany({
        where: {
          member: {
            is: {
              coached: {
                some: {},
              },
            },
          },
        },
        select: {
          email: true,
        },
      });
      coachs.forEach(({ email }) => emails.add(email));
    } else if (data.type == 'captains') {
      const captains = await this.prisma.user.findMany({
        where: {
          member: {
            is: {
              captained: {
                some: {},
              },
            },
          },
        },
        select: {
          email: true,
        },
      });
      captains.forEach(({ email }) => emails.add(email));
    } else if (data.type == 'players') {
      const players = await this.prisma.user.findMany({
        where: {
          member: {
            is: {
              players: {
                some: {},
              },
            },
          },
        },
        select: {
          email: true,
        },
      });
      players.forEach(({ email }) => emails.add(email));
    } else if (data.type == 'supports') {
      const supports = await this.prisma.user.findMany({
        where: {
          member: {
            is: {
              supports: {
                some: {},
              },
            },
          },
        },
        select: {
          email: true,
        },
      });
      supports.forEach(({ email }) => emails.add(email));
    } else {
      throw new Error('Invalid type');
    }

    this.handleSendTo(emails, data.subject, data.message);

    return emails;
  }

  handleSendTo = async (
    emails: Set<string>,
    subject: string,
    message: string,
  ) => {
    const delay = (60 * 1000) / 300;

    let count = 0;
    for (const email of emails) {
      try {
        await this.mailService.send_all_mail(email, subject, message);
        console.log(`Email sent to ${email}`);
        count++;
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
      }

      if (count < emails.size) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    console.log('Finished sending emails from Set.');
  };

  async getPassports(id: string) {
    const passports = new Map<string, string>();

    const allRelevantUsers = await this.prisma.team.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        country: true,
        tournament: {
          select: {
            name: true,
          },
        },
        coordinator: {
          select: {
            passport_image: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        coach: {
          select: {
            passport_image: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        captain: {
          select: {
            passport_image: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        players: {
          select: {
            member: {
              select: {
                passport_image: true,
                user: {
                  select: {
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
          },
        },
        supports: {
          select: {
            member: {
              select: {
                passport_image: true,
                user: {
                  select: {
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (allRelevantUsers.coordinator?.passport_image) {
      const ext = allRelevantUsers.coordinator.passport_image.split('.').pop();
      // passports.add({
      //   fileName: allRelevantUsers.coordinator.passport_image,
      //   newFileName: `${allRelevantUsers.country} - ${allRelevantUsers.tournament.name} - ${allRelevantUsers.coordinator.user.first_name} ${allRelevantUsers.coordinator.user.last_name}.${ext}`,
      // });
      passports.set(
        allRelevantUsers.coordinator.passport_image,
        `${allRelevantUsers.country} - ${allRelevantUsers.tournament.name} - ${allRelevantUsers.coordinator.user.first_name} ${allRelevantUsers.coordinator.user.last_name}.${ext}`,
      );
    }
    if (allRelevantUsers.coach?.passport_image) {
      const ext = allRelevantUsers.coach.passport_image.split('.').pop();
      passports.set(
        allRelevantUsers.coach.passport_image,
        `${allRelevantUsers.country} - ${allRelevantUsers.tournament.name} - ${allRelevantUsers.coach.user.first_name} ${allRelevantUsers.coach.user.last_name}.${ext}`,
      );
    }
    if (allRelevantUsers.captain?.passport_image) {
      const ext = allRelevantUsers.captain.passport_image.split('.').pop();
      passports.set(
        allRelevantUsers.captain.passport_image,
        `${allRelevantUsers.country} - ${allRelevantUsers.tournament.name} - ${allRelevantUsers.captain.user.first_name} ${allRelevantUsers.captain.user.last_name}.${ext}`,
      );
    }
    allRelevantUsers.players.forEach((player) => {
      if (player.member?.passport_image) {
        const ext = player.member.passport_image.split('.').pop();
        passports.set(
          player.member.passport_image,
          `${allRelevantUsers.country} - ${allRelevantUsers.tournament.name} - ${player.member.user.first_name} ${player.member.user.last_name}.${ext}`,
        );
      }
    });
    allRelevantUsers.supports.forEach((support) => {
      if (support.member?.passport_image) {
        const ext = support.member.passport_image.split('.').pop();
        passports.set(
          support.member.passport_image,
          `${allRelevantUsers.country} - ${allRelevantUsers.tournament.name} - ${support.member.user.first_name} ${support.member.user.last_name}.${ext}`,
        );
      }
    });

    return passports;
  }
}
