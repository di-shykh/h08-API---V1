"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailAdapter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
exports.emailAdapter = {
    sendConfirmationEmail(email, confirmationCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const info = yield transporter.sendMail({
                    from: `"Diana Shykh homework 07" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: "Confirmation email",
                    text: "Please, confirm your email", // Plain-text version of the message
                    html: `<h1>Thank for your registration</h1>
                     <p>To finish registration please follow the link below:
                         <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                     </p>`, // HTML version of the message
                });
                console.log('Email отправлен:', info.messageId);
            }
            catch (e) {
                console.error('Ошибка отправки email:', e);
                throw new Error('Не удалось отправить email');
            }
        });
    },
    resendEmail(email, confirmationCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const info = yield transporter.sendMail({
                    from: `"Diana Shykh homework 07" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: "Confirmation email",
                    text: "Hello world?", // Plain-text version of the message
                    html: `<h1>Thank for your registration</h1>
                     <p>To finish registration please follow the link below:
                         <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                     </p>`, // HTML version of the message
                });
                console.log('Email отправлен:', info.messageId);
            }
            catch (e) {
                console.error('Ошибка отправки email:', e);
                throw new Error('Не удалось отправить email');
            }
        });
    }
};
//# sourceMappingURL=email.adapter.js.map