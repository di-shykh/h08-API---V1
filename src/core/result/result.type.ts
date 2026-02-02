import {ResultStatus} from "./result.code";

type ExtensionType = {
    field: string| null;
    message: string;
}
export type Result<T = null> = {
    status: ResultStatus;
    errorMessage?: string;
    extensions: ExtensionType[];
    data: T | null;
}
//helper для создания результатов
export class ResultObject {
    static Created<T>(data: T): Result<T> {
        return{
            status: ResultStatus.Created,
            data,
            errorMessage:'',
            extensions: [],
        };
    }
    static Success<T>(data: T): Result<T> {
        return {
            status: ResultStatus.Success,
            data,
            errorMessage: '',
            extensions: [],
        };
    }
    static NoContent(): Result<null> {
        return {
            status: ResultStatus.NoContent,
            data: null,
            errorMessage: '',
            extensions: [],
        };
    }
    static NotFound(field: string, message: string): Result<null> {
        return {
            status: ResultStatus.NotFound,
            data: null,
            errorMessage: 'Not Found',
            extensions: [{field, message}],
        }
    }
    static BadRequest(field: string, message: string): Result<null> {
        return {
            status: ResultStatus.BadRequest,
            data: null,
            errorMessage: 'Bad Request',
            extensions: [{ field, message }],
        };
    }
    static Forbidden(): Result<null> {
        return {
            status: ResultStatus.Forbidden,
            data: null,
            errorMessage: 'Forbidden',
            extensions: [],
        }
    }
    static Unauthorized(): Result<null> {
        return {
            status:ResultStatus.Unauthorized,
            data:null,
            errorMessage: 'Unauthorized',
            extensions: [],
        }
    }
    static InternalServerError( message?: string): Result<null> {
        return {
            status: ResultStatus.InternalServerError,
            data: null,
            errorMessage: message || 'Internal Server Error',
            extensions: [],
        }
    }
}