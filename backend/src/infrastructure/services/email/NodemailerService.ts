import nodemailer, { Transporter } from 'nodemailer';

import { IEmailService } from '../../../application/interfaces/IEmailService';
import { env } from '../../config/env';
import { logger } from '../../../shared/utils/logger';

export class NodemailerService implements IEmailService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
    });
  }

  async sendVerificationCode(
    email: string,
    fullName: string,
    code: string,
  ): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Verifica tu correo institucional - CLAB Carpool',
      html: this.buildEmailTemplate({
        title: 'Verifica tu correo institucional',
        name: fullName,
        body: `Tu código de verificación es:`,
        code,
        note: 'Este código expira en 10 minutos. Si no solicitaste esta verificación, ignora este correo.',
      }),
    });
  }

  async sendPin(email: string, fullName: string, pin: string): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'PIN de validación de viaje - CLAB Carpool',
      html: this.buildEmailTemplate({
        title: 'PIN de validación de viaje',
        name: fullName,
        body: 'Tu PIN de validación para el viaje es:',
        code: pin,
        note: 'Comparte este PIN solo con pasajeros verificados al momento de abordar. Expira en 10 minutos.',
      }),
    });
  }

  private buildEmailTemplate(params: {
    title: string;
    name: string;
    body: string;
    code: string;
    note: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafb;">
        <div style="background: #ffffff; border-radius: 12px; padding: 32px; text-align: center;">
          <h2 style="color: #006971; margin: 0 0 8px;">${params.title}</h2>
          <p style="color: #45474a; margin: 0 0 24px;">Hola ${params.name},</p>
          <p style="color: #45474a; margin: 0 0 12px;">${params.body}</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #006971; background: #52d2df22; border-radius: 8px; padding: 16px; margin: 16px 0;">
            ${params.code}
          </div>
          <p style="color: #6d7478; font-size: 12px; margin: 16px 0 0;">${params.note}</p>
        </div>
      </div>
    `;
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (env.NODE_ENV === 'test') {
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"CLAB Carpool" <${env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      logger.error('Error enviando email', { error });
    }
  }
}
