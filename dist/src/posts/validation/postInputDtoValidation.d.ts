import { PostInputDto } from "../application/dtos/post.input-dto";
import { ValidationError } from "../../core/utils/validationError";
export declare const postInputDtoValidation: (data: PostInputDto) => ValidationError[];
export declare function isValidId(id: string): boolean;
export declare function isBlogIdExist(blogId: string): boolean;
//# sourceMappingURL=postInputDtoValidation.d.ts.map