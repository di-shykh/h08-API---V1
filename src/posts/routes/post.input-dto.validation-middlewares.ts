import {body} from "express-validator";
import {blogsQueryRepository} from "../../composition.root";

const titleValidation = body("title")
    .exists().withMessage("Title is required")
    .isString().withMessage("Title should be string")
    .trim()
    .isLength({min: 2, max: 30}).withMessage("Title should be min 2 characters long max 30");

const shortDescriptionValidation = body("shortDescription")
    .exists().withMessage("shortDescription is required")
    .isString().withMessage("shortDescription should be string")
    .trim()
    .isLength({min: 2, max: 100}).withMessage("shortDescription should be min 2 characters long max 100");
const contentValidation = body("content")
    .exists().withMessage("content is required")
    .isString().withMessage("content should be string")
    .trim()
    .isLength({min: 2, max: 1000}).withMessage("content should be min 2 characters long max 1000");
const blogIdValidation = body("blogId")
    .exists().withMessage("blogId is required")
    .isString().withMessage("blogId should be string")
    .trim()
    .custom(async (id: string): Promise<boolean> => {
        const blog = await blogsQueryRepository.findBlogById(id);
        if (!blog) {
            throw new Error("blogId does not exist");
        }
        return true;
    });
const createdAtValidation = body('createdAt')
    .exists().withMessage("createdAt is required")
    .isString().withMessage("createdAt should be string")
    .isISO8601({
        strict: true,        // Строгая проверка
        strictSeparator: true // Требует 'T' как разделитель
    }).withMessage("createdAt should be DateTime in ISOString")
export const postCreateInputValidation = [
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
];
export const postUpdateInputValidation = [
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
];
export const postCreateForBlogInputValidation = [
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
];
