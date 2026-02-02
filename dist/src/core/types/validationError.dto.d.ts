import { HttpStatus } from "./http-statuses";
type ValidationErrorOutput = {
    status: HttpStatus;
    detail: string;
    source: {
        pointer: string;
    };
    code: string | null;
};
export type ValidationErrorListOutput = {
    errors: ValidationErrorOutput[];
};
export {};
//# sourceMappingURL=validationError.dto.d.ts.map