import {PostInputDto} from "../application/dtos/post.input-dto";
import {ValidationError} from "../../core/utils/validationError";
import {blogsQueryRepository} from "../../composition.root";

export const postInputDtoValidation = (data: PostInputDto) :ValidationError[] => {
    const errors: ValidationError[] = [];

    if(
        !data.title ||
        typeof data.title !== "string" ||
        data.title.length < 2 ||
        data.title.length > 30
    ){
        errors.push({field: "title", message: "Title is required"});
    }
    if(
        !data.shortDescription ||
        typeof data.shortDescription !== "string" ||
        data.shortDescription.length < 2 ||
        data.shortDescription.length > 100
    ){
        errors.push({field: "shortDescription", message: "ShortDescription is required"});
    }
    if(
        !data.content ||
        typeof data.content !== "string" ||
        data.content.length < 2 ||
        data.content.length > 1000
    ){
        errors.push({field: "content", message: "Content is required"});
    }
    if(
        !data.blogId ||
        typeof data.blogId !== "string" ||
        !isValidId(data.blogId) ||
        !isBlogIdExist(data.blogId)
    ){
        errors.push({field: "blogId", message: "Invalid blogId"});
    }

    return errors;
}
//возможно не нужна
export function isValidId (id: string): boolean {
    const idInt = parseInt(id);
    if(idInt < 0 || isNaN(idInt)){
        return false;
    }
    return true;
}
export function isBlogIdExist(blogId: string): boolean {
    const blog = blogsQueryRepository.findBlogById(blogId);
    return !!blog;
}
