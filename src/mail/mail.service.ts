import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';
// import { Transporter } from 'nodemailer';
import { LoggerService } from 'src/logger/logger.service';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  // private transporter: Transporter;
  private readonly sender: string;
  private readonly homepage: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    // this.transporter = nodemailer.createTransport({
    //   host: configService.get('mail.host'),
    //   port: configService.get('mail.port'),
    //   secure: true,
    //   auth: {
    //     user: configService.get('mail.user'),
    //     pass: configService.get('mail.password'),
    //   },
    // });

    this.sender = configService.get('mail.user');

    this.homepage = configService.get('host.app');

    SendGrid.setApiKey(configService.get('mail.sendgrid'));
  }
  async send_mail(
    to: string,
    subject: string,
    templateId: string,
    dynamicTemplateData: SendGrid.MailDataRequired['dynamicTemplateData'],
  ) {
    // const info = await this.transporter
    //   .sendMail({
    //     from: this.sender,
    //     to,
    //     subject,
    //     html,
    //   })
    //   .catch((error) => {
    //     this.loggerService.log({
    //       error,
    //       path: 'src/mail/mail.service.ts',
    //       function: 'send_mail',
    //       tags: ['mail', 'send_mail'],
    //       extra: { to, subject },
    //     });
    //   });
    const mail: SendGrid.MailDataRequired = {
      from: this.sender,
      to,
      subject,
      templateId,
      dynamicTemplateData,
    };
    const info = await SendGrid.send(mail).catch((error) => {
      this.loggerService.log({
        error,
        path: 'src/mail/mail.service.ts',
        function: 'send_mail',
        tags: ['mail', 'send_mail'],
        extra: { to, subject },
      });
    });
    return info;
  }

  async welcome_player(
    coordinator: string,
    country: string,
    email: string,
    password: string,
  ) {
    const subject = 'Welcome to the Pickleball World Cup!';
    // const html = `
    //     <html>
    //         <head>
    //         <style>
    //             body {
    //             font-family: Arial, sans-serif;
    //             background-color: #f8f8f8;
    //             padding: 20px;
    //             }
    //             .container {
    //             max-width: 600px;
    //             margin: 0 auto;
    //             background-color: #ffffff;
    //             padding: 20px;
    //             border-radius: 5px;
    //             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    //             text-align:center;
    //             }

    //             .container img{
    //             width:4rem;
    //             height:4rem;
    //             object-fit:contain;
    //             }
    //             h1 {
    //             font-size: 24px;
    //             color: #333333;
    //             margin-bottom: 20px;
    //             }
    //             p {
    //             color: #555555;
    //             margin-bottom: 10px;
    //             }
    //             a {
    //             color: #007bff;
    //             text-decoration: none;
    //             }
    //             .button {
    //             display: inline-block;
    //             background-color: #EFB810;
    //             color: #000 !important;
    //             border-radius: 4px;
    //             padding: 10px 20px;
    //             margin-top: 20px;
    //             text-decoration: none;
    //             }

    //             .banner{

    //             height: auto;
    //             width:100%;

    //             }

    //         </style>
    //         </head>
    //         <body>
    //         <div class="container">
    //         <img style=" width:100%;display:flex;align-items:center;border-radius: 1rem;height:auto;" class="banner" src="https://copamundialdepickleball.com/mail-player.webp" />

    //         <h1>Welcome to the Pickleball World Cup!</h1>
    //             <p>You have been invited to participate by ${coordinator} to represent ${country}.</p>
    //             <p>Your username: ${email}</p>
    //             <p>Your password: ${password}</p>
    //             <a class="button" href="${this.homepage}">Set up your account</a>
    //         </div>
    //         </body>
    //     </html>
    //     `;

    // return this.send_mail(html, email, subject);
    return this.send_mail(
      email,
      subject,
      this.configService.get('mail.template.players'),
      {
        coordinator,
        country,
        email,
        password,
      },
    );
  }
  async welcome_support(
    coordinator: string,
    country: string,
    email: string,
    password: string,
  ) {
    const subject = 'Welcome to the Pickleball World Cup!';
    // const html = `
    //     <html>
    //         <head>
    //         <style>
    //             body {
    //             font-family: Arial, sans-serif;
    //             background-color: #f8f8f8;
    //             padding: 20px;
    //             }
    //             .container {
    //             max-width: 600px;
    //             margin: 0 auto;
    //             background-color: #ffffff;
    //             padding: 20px;
    //             border-radius: 5px;
    //             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    //             text-align:center;
    //             }

    //             .container img{
    //             width:4rem;
    //             height:4rem;
    //             object-fit:contain;
    //             }
    //             h1 {
    //             font-size: 24px;
    //             color: #333333;
    //             margin-bottom: 20px;
    //             }
    //             p {
    //             color: #555555;
    //             margin-bottom: 10px;
    //             }
    //             a {
    //             color: #007bff;
    //             text-decoration: none;
    //             }
    //             .button {
    //             display: inline-block;
    //             background-color: #EFB810;
    //             color: #000 !important;
    //             border-radius: 4px;
    //             padding: 10px 20px;
    //             margin-top: 20px;
    //             text-decoration: none;
    //             }

    //             .banner{

    //             height: auto;
    //             width:100%;

    //             }

    //         </style>
    //         </head>
    //         <body>
    //         <div class="container">
    //         <img style=" width:100%;display:flex;align-items:center;border-radius: 1rem;height:auto;" class="banner" src="https://copamundialdepickleball.com/mail-player.webp" />

    //         <h1>Welcome to the Pickleball World Cup!</h1>
    //             <p>You have been invited to participate by ${coordinator} to support ${country}.</p>
    //             <p>Your username: ${email}</p>
    //             <p>Your password: ${password}</p>
    //             <a class="button" href="${this.homepage}">Set up your account</a>
    //         </div>
    //         </body>
    //     </html>
    //     `;

    return await this.send_mail(
      email,
      subject,
      this.configService.get('mail.template.supports'),
      {
        coordinator,
        country,
        email,
        password,
      },
    );
  }
  async welcome_coordinator(
    coordinator: string,
    email: string,
    password: string,
  ) {
    const subject = 'Welcome to the Pickleball World Cup!';
    // const html = `
    //     <html>
    //         <head>
    //         <style>
    //             body {
    //             font-family: Arial, sans-serif;
    //             background-color: #f8f8f8;
    //             padding: 20px;
    //             }
    //             .container {
    //             max-width: 600px;
    //             margin: 0 auto;
    //             background-color: #ffffff;
    //             padding: 20px;
    //             border-radius: 5px;
    //             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    //             text-align:center;
    //             }

    //             .container img{
    //             width:4rem;
    //             height:4rem;
    //             object-fit:contain;
    //             }
    //             h1 {
    //             font-size: 24px;
    //             color: #333333;
    //             margin-bottom: 20px;
    //             }
    //             p {
    //             color: #555555;
    //             margin-bottom: 10px;
    //             font-size:16px;
    //             }
    //             a {
    //             color: #007bff;
    //             text-decoration: none;
    //             }
    //             .button {
    //             display: inline-block;
    //             background-color: #EFB810;
    //             color: #000 !important;
    //             border-radius: 4px;
    //             padding: 10px 20px;
    //             margin-top: 10px;
    //             text-decoration: none;
    //             }

    //             .banner{

    //             height: auto;
    //             width:100%;

    //             }

    //         </style>
    //         </head>
    //         <body>
    //         <div class="container">
    //         <img style=" width:100%;display:flex;align-items:center;border-radius: 1rem;height:auto;" class="banner" src="https://copamundialdepickleball.com/mail-coordinator.webp" />
    // <div style="width:100%; text-align:left;margin-top:20px;">
    //         <p>Dear ${coordinator},</p>
    //             <p>We are excited to extend our congratulations on your selection as the Team Coordinator for your delegation.</p>
    //             <p>As the Team Coordinator, you will play the role in ensuring the success of your delegation.</p>
    //             <p style="margin-bottom:0">Please find your username for the registration below:</p>
    //             <p style="margin-top:0">Your username: ${email}</p>
    //             <p style="margin-top:0">Your password: ${password}</p>
    //             <a class="button" href="${this.homepage}">Set up your account</a>
    //             <p>Wishing you the best of luck and can't wait to see you there!</p>
    //             <p style="margin-bottom:0">All the best,</p>
    //             <p style="margin-top:0"><b>Pickleball World Cup Team</b></p>
    //             </div>
    //         </div>
    //         </body>
    //     </html>
    //     `;
    return await this.send_mail(
      email,
      subject,
      this.configService.get('mail.template.coordinator'),
      {
        coordinator,
        email,
        password,
      },
    );
  }
  async generate_password(name: string, email: string, token: string) {
    const final_url = this.homepage + '?token=' + token;
    const subject = 'Reset Password Request!';
    // const html = `
    //     <html>
    //         <head>
    //         <style>
    //             body {
    //             font-family: Arial, sans-serif;
    //             background-color: #f8f8f8;
    //             padding: 20px;
    //             }
    //             .container {
    //             max-width: 600px;
    //             margin: 0 auto;
    //             background-color: #ffffff;
    //             padding: 20px;
    //             border-radius: 5px;
    //             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    //             text-align:center;
    //             }

    //             .container img{
    //             width:4rem;
    //             height:4rem;
    //             object-fit:contain;
    //             }
    //             h1 {
    //             font-size: 24px;
    //             color: #333333;
    //             margin-bottom: 20px;
    //             }
    //             p {
    //             color: #555555;
    //             margin-bottom: 10px;
    //             font-size:16px;
    //             }
    //             a {
    //             color: #007bff;
    //             text-decoration: none;
    //             }
    //             .button {
    //             display: inline-block;
    //             background-color: #EFB810;
    //             color: #000 !important;
    //             border-radius: 4px;
    //             padding: 10px 20px;
    //             margin-top: 10px;
    //             text-decoration: none;
    //             }

    //             .banner{

    //             height: auto;
    //             width:100%;

    //             }

    //         </style>
    //         </head>
    //         <body>
    //         <div class="container">
    //         <img style=" width:100%;display:flex;align-items:center;border-radius: 1rem;height:auto;" class="banner" src="https://copamundialdepickleball.com/mail-coordinator.webp" />
    // <div style="width:100%; text-align:left;margin-top:20px;">
    //         <p>Hello ${name},</p>
    //             <p>We received a request to reset your password for your account.</p>
    //             <p>If you made this request, please click the button below to set a new password:</p>
    //             <a class="button" href="${final_url}">Change your password</a>
    //             <p>If you didn’t request a password reset, please ignore this email.</p>

    //             <p style="margin-bottom:0">All the best,</p>
    //             <p style="margin-top:0"><b>Pickleball World Cup Team</b></p>
    //             </div>
    //         </div>
    //         </body>
    //     </html>
    //     `;
    return await this.send_mail(
      email,
      subject,
      this.configService.get('mail.template.password'),
      {
        name,
        final_url,
      },
    );
  }
  async coordinator_new(email: string, password: string) {
    const subject = 'Team Coordinator Website Update';
    // const html = `
    //     <html>
    //         <head>
    //         <style>
    //             body {
    //             font-family: Arial, sans-serif;
    //             background-color: #f8f8f8;
    //             padding: 20px;
    //             }
    //             .container {
    //             max-width: 600px;
    //             margin: 0 auto;
    //             background-color: #ffffff;
    //             padding: 20px;
    //             border-radius: 5px;
    //             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    //             text-align:center;
    //             }

    //             .container img{
    //             width:4rem;
    //             height:4rem;
    //             object-fit:contain;
    //             }
    //             h1 {
    //             font-size: 24px;
    //             color: #333333;
    //             margin-bottom: 20px;
    //             }
    //             p {
    //             color: #555555;
    //             margin-bottom: 10px;
    //             font-size:16px;
    //             }
    //             a {
    //             color: #007bff;
    //             text-decoration: none;
    //             }
    //             .button {
    //             display: inline-block;
    //             background-color: #EFB810;
    //             color: #000 !important;
    //             border-radius: 4px;
    //             padding: 10px 20px;
    //             margin-top: 10px;
    //             text-decoration: none;
    //             }

    //             .banner{

    //             height: auto;
    //             width:100%;

    //             }

    //         </style>
    //         </head>
    //         <body>
    //         <div class="container">
    //         <img style=" width:100%;display:flex;align-items:center;border-radius: 1rem;height:auto;" class="banner" src="https://copamundialdepickleball.com/mail-coordinator.webp" />
    // <div style="width:100%; text-align:left;margin-top:20px;">
    //         <p>Hi Team Coordinator,</p>
    //             <p>Hope you are fine.</p>
    //             <p>This e-mail is to tell you that we have updated the official website of the Pickleball World Cup</p>
    //             <p>So, here we send your new password to log in for the first time, after this, feel free to change this password.</p>
    //             <p style="margin-bottom:0">Please find your username for the registration below:</p>
    //             <p style="margin-top:0">Your username: ${email}</p>
    //             <p style="margin-top:0">Your password: ${password}</p>
    //             <a class="button" href="${this.homepage}">Set up your account</a>
    //             <p>Feel free to contact us if you have any question about it.</p>
    //             <p>Here is our customer service phone: +1 (239) 826-3306.</p>
    //             <p style="margin-bottom:0">All the best,</p>
    //             <p style="margin-top:0"><b>Pickleball World Cup Team</b></p>
    //             </div>
    //         </div>
    //         </body>
    //     </html>
    //     `;
    return await this.send_mail(
      email,
      subject,
      this.configService.get('mail.template.coordinator'),
      {
        email,
        password,
      },
    );
  }
  async event_confirmation(event_code: string, name: string, email: string) {
    if (event_code == 'TOUR') {
      return await this.event_confirmation_tour(name, email);
    } else if (event_code == 'REFEREE') {
      return await this.event_confirmation_referee(name, email);
    } else if (event_code == 'PICKLEBALL') {
      return await this.event_confirmation_clinic(name, email);
    } else {
      return null;
    }
  }
  async event_confirmation_tour(name: string, email: string) {
    const subject = 'Confirmation for the Lima City Tour';
    // const html = `
    //     <html>
    //         <head>
    //         <style>
    //             body {
    //             font-family: Arial, sans-serif;
    //             background-color: #f8f8f8;
    //             padding: 20px;
    //             }
    //             .container {
    //             max-width: 600px;
    //             margin: 0 auto;
    //             background-color: #ffffff;
    //             padding: 20px;
    //             border-radius: 5px;
    //             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    //             text-align:center;
    //             }

    //             .container img{
    //             width:4rem;
    //             height:4rem;
    //             object-fit:contain;
    //             }
    //             h1 {
    //             font-size: 24px;
    //             color: #333333;
    //             margin-bottom: 20px;
    //             }
    //             p {
    //             color: #555555;
    //             margin-bottom: 10px;
    //             }
    //             a {
    //             color: #007bff;
    //             text-decoration: none;
    //             }
    //             .button {
    //             display: inline-block;
    //             background-color: #EFB810;
    //             color: #000 !important;
    //             border-radius: 4px;
    //             padding: 10px 20px;
    //             margin-top: 20px;
    //             text-decoration: none;
    //             }

    //             .banner{

    //             height: auto;
    //             width:100%;

    //             }

    //         </style>
    //         </head>
    //         <body>
    //         <div class="container">
    //         <img style=" width:100%;display:flex;align-items:center;border-radius: 1rem;height:auto;" class="banner" src="https://copamundialdepickleball.com/mail-player.webp" />

    //         <h1>Hi ${name} </h1>
    //             <p>Hope you are fine.</p>
    //             <p>Welcome to our exciting Lima city tour! We are delighted that you have decided to join this unique</p>
    //             <p>experience that celebrates the union and understanding between our cultures through the sport.</p>
    //             <p>During this full day tour, you will have the opportunity to meet people from the different delegations</p>
    //             <p>of the Pickleball World Cup, share stories, learn about local traditions and enjoy unforgettable moments.</p>
    //             <p>During this full day tour, you will have the opportunity to meet people from the different delegations</p>
    //             <p>Get ready for an adventure full of discovery, friendship and fun. See you soon and let the adventure begin!</p>

    //             <p>Feel free to contact us if you have any question about it.</p>
    //             <p>Here is our customer service phone: +1 (239) 826-3306.</p>
    //             <p style="margin-bottom:0">All the best,</p>
    //             <p style="margin-top:0"><b>Pickleball World Cup Team</b></p>
    //         </div>
    //         </body>
    //     </html>
    //     `;

    return await this.send_mail(
      email,
      subject,
      this.configService.get('mail.template.players'),
      {
        name,
        message: `Welcome to our exciting Lima city tour! We are delighted that you have decided to join this unique experience that celebrates the union and understanding between our cultures through the sport. During this full day tour, you will have the opportunity to meet people from the different delegations of the Pickleball World Cup, share stories, learn about local traditions and enjoy unforgettable moments. Get ready for an adventure full of discovery, friendship and fun. See you soon and let the adventure begin!`,
      },
    );
  }
  async event_confirmation_clinic(name: string, email: string) {
    const subject = 'Confirmation for the Pickleball Clinic by ROB CASSIDY';
    // const html = `
    //     <html>
    //         <head>
    //         <style>
    //             body {
    //             font-family: Arial, sans-serif;
    //             background-color: #f8f8f8;
    //             padding: 20px;
    //             }
    //             .container {
    //             max-width: 600px;
    //             margin: 0 auto;
    //             background-color: #ffffff;
    //             padding: 20px;
    //             border-radius: 5px;
    //             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    //             text-align:center;
    //             }

    //             .container img{
    //             width:4rem;
    //             height:4rem;
    //             object-fit:contain;
    //             }
    //             h1 {
    //             font-size: 24px;
    //             color: #333333;
    //             margin-bottom: 20px;
    //             }
    //             p {
    //             color: #555555;
    //             margin-bottom: 10px;
    //             }
    //             a {
    //             color: #007bff;
    //             text-decoration: none;
    //             }
    //             .button {
    //             display: inline-block;
    //             background-color: #EFB810;
    //             color: #000 !important;
    //             border-radius: 4px;
    //             padding: 10px 20px;
    //             margin-top: 20px;
    //             text-decoration: none;
    //             }

    //             .banner{

    //             height: auto;
    //             width:100%;

    //             }

    //         </style>
    //         </head>
    //         <body>
    //         <div class="container">
    //         <img style=" width:100%;display:flex;align-items:center;border-radius: 1rem;height:auto;" class="banner" src="https://copamundialdepickleball.com/mail-player.webp" />

    //         <h1>Hi ${name} </h1>
    //             <p>Hope you are fine.</p>
    //             <p>This e-mail is to tell you that we you have registered successfully to the PICKLEBALL CLINIC BY ROB CASSIDY.</p>
    //             <p>So, see you on the courts on October 22 at 4 pm at National Sport Village (VIDENA) in Lima, Peru.</p>

    //             <p>Feel free to contact us if you have any question about it.</p>
    //             <p>Here is our customer service phone: +1 (239) 826-3306.</p>
    //             <p style="margin-bottom:0">All the best,</p>
    //             <p style="margin-top:0"><b>Pickleball World Cup Team</b></p>
    //         </div>
    //         </body>
    //     </html>
    //     `;

    return await this.send_mail(
      email,
      subject,
      this.configService.get('mail.template.players'),
      {
        name,
        message: `This e-mail is to tell you that we you have registered successfully to the PICKLEBALL CLINIC BY ROB CASSIDY. So, see you on the courts on October 22 at 4 pm at National Sport Village (VIDENA) in Lima, Peru.`,
      },
    );
  }
  async event_confirmation_referee(name: string, email: string) {
    const subject = 'Confirmation for the Referee Masterclass';
    //   const html = `
    //       <html>
    //           <head>
    //           <style>
    //               body {
    //               font-family: Arial, sans-serif;
    //               background-color: #f8f8f8;
    //               padding: 20px;
    //               }
    //               .container {
    //               max-width: 600px;
    //               margin: 0 auto;
    //               background-color: #ffffff;
    //               padding: 20px;
    //               border-radius: 5px;
    //               box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    //               text-align:center;
    //               }

    //               .container img{
    //               width:4rem;
    //               height:4rem;
    //               object-fit:contain;
    //               }
    //               h1 {
    //               font-size: 24px;
    //               color: #333333;
    //               margin-bottom: 20px;
    //               }
    //               p {
    //               color: #555555;
    //               margin-bottom: 10px;
    //               }
    //               a {
    //               color: #007bff;
    //               text-decoration: none;
    //               }
    //               .button {
    //               display: inline-block;
    //               background-color: #EFB810;
    //               color: #000 !important;
    //               border-radius: 4px;
    //               padding: 10px 20px;
    //               margin-top: 20px;
    //               text-decoration: none;
    //               }

    //               .banner{

    //               height: auto;
    //               width:100%;

    //               }

    //           </style>
    //           </head>
    //           <body>
    //           <div class="container">
    //           <img style=" width:100%;display:flex;align-items:center;border-radius: 1rem;height:auto;" class="banner" src="https://copamundialdepickleball.com/mail-player.webp" />

    //           <h1>Hi ${name} </h1>
    //               <p>Hope you are fine.</p>
    //               <p>This e-mail is to tell you that we you have registered successfully to the REFEREE MASTERCLASS by USA</p>
    //               <p>Pickleball Certified Referees. So, see you on the courts on October 28 at 8 am at National Sport Village</p>
    //               <p>(VIDENA) in Lima, Peru.</p>

    //               <p>Feel free to contact us if you have any question about it.</p>
    //               <p>Here is our customer service phone: +1 (239) 826-3306.</p>
    //               <p style="margin-bottom:0">All the best,</p>
    //               <p style="margin-top:0"><b>Pickleball World Cup Team</b></p>
    //           </div>
    //           </body>
    //       </html>
    //       `;

    return await this.send_mail(
      email,
      subject,
      this.configService.get('mail.template.players'),
      {
        name,
        message: `This e-mail is to tell you that we you have registered successfully to the REFEREE MASTERCLASS by USA Pickleball Certified Referees. So, see you on the courts on October 28 at 8 am at National Sport Village (VIDENA) in Lima, Peru.`,
      },
    );
  }

  async send_all_mail(email: string, subject: string, message: string) {
    //   const html = `
    //       <html>
    //           <head>
    //           <style>
    //               body {
    //               font-family: Arial, sans-serif;
    //               background-color: #f8f8f8;
    //               padding: 20px;
    //               }
    //               .container {
    //               max-width: 600px;
    //               margin: 0 auto;
    //               background-color: #ffffff;
    //               padding: 20px;
    //               border-radius: 5px;
    //               box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    //               text-align:center;
    //               }

    //               .container img{
    //               width:4rem;
    //               height:4rem;
    //               object-fit:contain;
    //               }
    //               h1 {
    //               font-size: 24px;
    //               color: #333333;
    //               margin-bottom: 20px;
    //               }
    //               p {
    //               color: #555555;
    //               margin-bottom: 10px;
    //               font-size:16px;
    //               }
    //               a {
    //               color: #007bff;
    //               text-decoration: none;
    //               }
    //               .button {
    //               display: inline-block;
    //               background-color: #EFB810;
    //               color: #000 !important;
    //               border-radius: 4px;
    //               padding: 10px 20px;
    //               margin-top: 10px;
    //               text-decoration: none;
    //               }

    //               .banner{

    //               height: auto;
    //               width:100%;

    //               }

    //           </style>
    //           </head>
    //           <body>
    //           <div class="container">
    //           <img style="width:100%;display:flex;align-items:center;border-radius: 1rem;height:auto;" class="banner" src="https://copamundialdepickleball.com/mail-player.webp" />
    //           <div style="width:100%; text-align:left;margin-top:20px;">
    //               <p style="white-space:pre-wrap;">${message}</p>
    //               <p style="margin-bottom:0">All the best,</p>
    //               <p style="margin-top:0"><b>Pickleball World Cup Team</b></p>
    //               </div>
    //           </div>
    //           </body>
    //       </html>
    //       `;
    return await this.send_mail(
      email,
      subject,
      this.configService.get('mail.template.massive'),
      {
        subject,
        message,
      },
    );
  }
}
