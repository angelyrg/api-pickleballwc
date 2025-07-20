export type MAIL_TYPE =
  | 'all'
  | 'coordinators'
  | 'coachs'
  | 'captains'
  | 'players'
  | 'supports';

export class SendMailDto {
  type: MAIL_TYPE;

  subject: string;

  message: string;
}
