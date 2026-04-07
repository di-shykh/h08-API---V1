export type PasswordRecovery = {
    userId: string;
    isUsed: boolean;
    passwordRecoveryCode: string;
    passwordRecoveryExpiration: Date;
}