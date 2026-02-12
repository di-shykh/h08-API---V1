import {Request, Response, NextFunction} from "express";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {errorHandler} from "../../core/errors/error.handler";
import {ObjectId} from "mongodb";
import {blogsQueryRepository} from "../../composition.root";

function isValidObjectId(id: string): boolean {
    try{
        const objectId= new ObjectId(id);
        return objectId.toString() === id;
    }
    catch(err){
        return false;
    }
}

export const blogExistingIdValidationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id as string;
    try{
        if(id) {
            if(isValidObjectId(id)) {
                const blog = await blogsQueryRepository.findBlogByIdOrFail(id);
                if(!blog) {
                    console.log("error blogWithIdExistsValidation in if");
                    throw new RepositoryNotFoundError(`Blog with id ${id} not found`);
                }
            }
        }
        next();
    }
    catch (error) {
        errorHandler(error,res);
    }
}