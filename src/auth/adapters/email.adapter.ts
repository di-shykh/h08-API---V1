import nodemailer from 'nodemailer';
import {SETTINGS} from "../../core/settings/settings";

export class EmailAdapter {
    transporter: nodemailer.Transporter;
    constructor() {
         this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use true for port 465, false for port 587
            auth: {
                user: SETTINGS.EMAIL_USER,
                pass: SETTINGS.EMAIL_PASSWORD
            },
        });
    }
    async sendConfirmationEmail(email: string, confirmationCode: string): Promise<void> {
        try{
            const info = await this.transporter.sendMail({
                from: `"Diana Shykh homework 07" <${SETTINGS.EMAIL_FROM}>`,
                to: email,
                subject: "Confirmation email",
                text: "Please, confirm your email", // Plain-text version of the message
                html: `<h1>Thank for your registration</h1>
                     <p>To finish registration please follow the link below:
                         <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                     </p>`, // HTML version of the message
            });
            console.log('Email отправлен:', info.messageId);
        } catch (e) {
            console.error('Ошибка отправки email:', e);
            throw new Error('Не удалось отправить email');
        }

    }
    async resendEmail(email: string, confirmationCode: string): Promise<void> {
        try{
            const info = await this.transporter.sendMail({
                from: `"Diana Shykh homework 07" <${SETTINGS.EMAIL_FROM}>`,
                to: email,
                subject: "Confirmation email",
                text: "Hello world?", // Plain-text version of the message
                html: `<h1>Thank for your registration</h1>
                     <p>To finish registration please follow the link below:
                         <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                     </p>`, // HTML version of the message
            });
            console.log('Email отправлен:', info.messageId);
        } catch (e) {
            console.error('Ошибка отправки email:', e);
            throw new Error('Не удалось отправить email');
        }
    }
    async sendRecoveryCodeOnEmail(email: string, recoveryCode: string): Promise<void> {
        try{
            const info = await this.transporter.sendMail({
                from: `"Diana Shykh homework 10" <${SETTINGS.EMAIL_FROM}>`,
                to: email,
                subject: "Password Recovery",
                html: `<h1>Password recovery</h1>
                           <p>To finish password recovery please follow the link below:
                              <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
                          </p>`, // HTML version of the message
            });
            console.log('Email отправлен:', info.messageId);
        } catch (e) {
            console.error('Ошибка отправки email:', e);
            throw new Error('Не удалось отправить email');
        }
    }
}
