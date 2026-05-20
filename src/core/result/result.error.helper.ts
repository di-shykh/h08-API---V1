import { DomainError } from "../errors/domain.error";
import { DuplicateFieldError } from "../errors/duplicateField.error";
import { RepositoryNotFoundError } from "../errors/repository-not-found.error";
import { ResultObject } from "./result.type";

export class ResultErrorHelper {
    static toResult(error: unknown): ReturnType<typeof ResultObject.InternalServerError>  {
        console.log('Service error:', error);
        if(error instanceof RepositoryNotFoundError) {
            return ResultObject.NotFound('entity', error.message);
        }
        if (error instanceof DuplicateFieldError) {
            return ResultObject.BadRequest(error.field||'duplicate', error.message);
        }
        if (error instanceof DomainError) {
            return ResultObject.BadRequest(error.field||'domain', error.message);
        }
        if (error instanceof Error) {
            if (error.name === 'ValidationError') {
                return ResultObject.BadRequest('validation', error.message);
            }
            if (error.name === 'MongoServerError' && (error as any).code === 11000) {
                const field = Object.keys((error as any).keyPattern)[0];
                return ResultObject.BadRequest(field, `${field} already exists`);
            }
            if (error.name === 'CastError') {
                return ResultObject.BadRequest('id', 'Invalid ID format');
            }
        }
        return ResultObject.InternalServerError('Internal server error');
    }
}