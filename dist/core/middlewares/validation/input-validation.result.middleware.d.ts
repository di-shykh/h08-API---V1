import { Request, Response, NextFunction } from "express";
export type APIErrorResult = {
    errorsMessages: FieldError[];
};
export type FieldError = {
    message: string;
    field: string;
};
export declare const createErrorMessages: (errors: FieldError[]) => APIErrorResult;
export declare const inputValidationResultMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=input-validation.result.middleware.d.ts.map