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
exports.blogsService = void 0;
const blogs_repository_1 = require("../repositories/blogs.repository");
const posts_repository_1 = require("../../posts/repositories/posts.repository");
const posts_query_repository_1 = require("../../posts/repositories/posts.query-repository");
exports.blogsService = {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const newBlog = {
                name: dto.name,
                description: dto.description,
                websiteUrl: dto.websiteUrl,
                createdAt: new Date().toISOString(),
                isMembership: false,
            };
            return yield blogs_repository_1.blogsRepository.createBlog(newBlog);
        });
    },
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateResult = yield blogs_repository_1.blogsRepository.updateBlog(id, dto);
            return;
        });
    },
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const postsWithBlogId = yield posts_query_repository_1.postsQueryRepository.findPostsByBlogId(id);
            if (postsWithBlogId && postsWithBlogId.totalCount > 0) {
                yield Promise.all(postsWithBlogId.items.map((post) => {
                    posts_repository_1.postsRepository.deletePost(post._id.toString());
                }));
            }
            yield blogs_repository_1.blogsRepository.deleteBlog(id);
            return;
        });
    }
};
//# sourceMappingURL=blog.service.js.map