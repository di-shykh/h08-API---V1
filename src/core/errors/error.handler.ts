import {Response} from "express";
import {RepositoryNotFoundError} from "./repository-not-found.error";
import {HttpStatus} from "../types/http-statuses";
import {APIErrorResult} from "../middlewares/validation/input-validation.result.middleware";
import {DomainError} from "./domain.error";
import {DuplicateFieldError} from "./duplicateField.error";

// Функция для создания ошибок в нужном формате
const createErrorResult = (errors: Array<{message: string, field?: string}>): APIErrorResult => {
   return {
       errorsMessages: errors.map(error =>({
           message: error.message,
           field: error.field||'',
       }))
   };
};

export function errorHandler(error: unknown, res: Response): void {
    console.log("Error from create user:", error);
    if (error instanceof DuplicateFieldError) {
        res.status(HttpStatus.BadRequest).json(
            createErrorResult([
                {
                    message: error.message,
                    field: error.field || '',
                },
            ])
        );
    }
    if( error instanceof RepositoryNotFoundError ) {
        res.status(HttpStatus.NotFound).json(
            createErrorResult([
                {message: error.message},
            ])
        );
        return;
    }
    if (error instanceof DomainError) {
        res.status(HttpStatus.BadRequest).json(
           createErrorResult([
               {
                   message: error.message,
                   field: error.field||'',
               },
           ])
        );
        return;
    }
    res.status(HttpStatus.InternalServerError).json(
        createErrorResult([
            {message: "Internal server error"},
        ])
    );
    return;
}