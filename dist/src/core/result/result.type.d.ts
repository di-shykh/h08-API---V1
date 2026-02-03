import { ResultStatus } from "./result.code";
type ExtensionType = {
    field: string | null;
    message: string;
};
export type Result<T = null> = {
    status: ResultStatus;
    errorMessage?: string;
    extensions: ExtensionType[];
    data: T | null;
};
export declare class ResultObject {
    static Created<T>(data: T): Result<T>;
    static Success<T>(data: T): Result<T>;
    static NoContent(): Result<null>;
    static NotFound(field: string, message: string): Result<null>;
    static BadRequest(field: string, message: string): Result<null>;
    static Forbidden(): Result<null>;
    static Unauthorized(): Result<null>;
    static InternalServerError(message?: string): Result<null>;
}
export {};
//# sourceMappingURL=result.type.d.ts.map