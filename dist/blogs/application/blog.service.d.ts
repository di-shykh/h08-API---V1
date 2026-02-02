import { BlogAttributes } from "./dtos/blog-attributes";
export declare const blogsService: {
    create(dto: BlogAttributes): Promise<string>;
    update(id: string, dto: BlogAttributes): Promise<void>;
    delete(id: string): Promise<void>;
};
//# sourceMappingURL=blog.service.d.ts.map