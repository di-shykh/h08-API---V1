import { UserCreateInput } from "../../users/routes/input/create-user.input";
import { Result } from "../../core/result/result.type";
export declare const authService: {
    loginUser(loginOrEmail: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null>;
    createUser(userInputDto: UserCreateInput): Promise<Result<string | null>>;
    confirmUserRegistration(code: string): Promise<Result<boolean | null>>;
    resendEmail(email: string): Promise<Result<boolean | null>>;
    addTokenToBlackList(token: string): Promise<Result<string | {
        message: string;
    } | null>>;
};
//# sourceMappingURL=auth.service.d.ts.map