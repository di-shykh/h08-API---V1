import {param, body} from "express-validator";
import {RepositoryNotFoundError} from "../../errors/repository-not-found.error";
import {blogsQueryRepository} from "../../../composition.root";

export const idValidator = param("id")
    .exists().withMessage('id is required')
    .isString().withMessage('id must be a string')
    .isLength({ min: 1 }).withMessage('id must be not empty')
    .isMongoId().withMessage('Incorrect format of ObjectId')

export const blogWithIdExistsValidation = param("id")
    .exists().withMessage('Id is required')
    .custom(async (id: string, { req }): Promise<boolean> => {
        if(id) {
            try{
                const blog = await blogsQueryRepository.findBlogByIdOrFail(id);
                if(!blog) {
                    console.log("error blogWithIdExistsValidation in if");
                    throw new RepositoryNotFoundError(`Blog with id ${id} not found`);
                }
                return true;
            }
            catch (error) {
                console.log("error blogWithIdExistsValidation",error);
                req.sendStatus(404);
                throw error;
            }

        }
        return false;
    })