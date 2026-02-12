export type UserDB = {
    login: string;
    passwordHash: string;
    email: string;
    createdAt: string;
    emailConfirmation?: {
        isConfirmed: boolean;
        confirmationCode: string;
        expirationDate: string;
    };
    passwordRecovery?: {
        isUsed: boolean;
        passwordRecoveryCode: string;
        passwordRecoveryExpiration: string;
    }
}