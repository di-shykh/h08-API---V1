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
};
//# sourceMappingURL=user.db.d.ts.map