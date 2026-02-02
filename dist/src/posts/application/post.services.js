"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsService = void 0;
const posts_repository_1 = require("../repositories/posts.repository");
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
const blogs_query_repository_1 = require("../../blogs/repositories/blogs.query-repository");
exports.postsService = {
    createPost(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const blog = yield blogs_query_repository_1.blogsQueryRepository.findBlogByIdOrFail(dto.blogId);
            if (!blog) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("Blog does not exist");
            }
            const newPost = {
                title: dto.title,
                shortDescription: dto.shortDescription,
                content: dto.content,
                blogId: dto.blogId,
                blogName: blog.name,
                createdAt: new Date().toISOString(),
            };
            return yield posts_repository_1.postsRepository.createPost(newPost);
        });
    },
    updatePost(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            yield posts_repository_1.postsRepository.updatePost(id, dto);
        });
    },
    deletePost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield posts_repository_1.postsRepository.deletePost(id);
        });
    }
};
//# sourceMappingURL=post.services.js.map